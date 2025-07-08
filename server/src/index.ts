import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import passport from './auth/passport';
import { signup } from './auth/local';
import session from 'express-session';
import { generateToken } from './auth/jwt';
import { getUserFromToken } from './auth/jwt';
import { handleEmailVerification, generatePasswordResetToken, sendPasswordResetEmail } from './auth/email';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { config, corsConfig, securityConfig } from './config';
import { logger, logError, logInfo, logRequest } from './utils/logger';
import {
    rateLimiter,
    authRateLimiter,
    securityHeaders,
    validateInput,
    validationSchemas,
    sanitizeInput,
    errorHandler,
    requestSizeLimit,
    passwordResetRateLimiter
} from './middleware/security';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function startServer() {
    // Set up Express
    const app = express();

    // Security middleware
    app.use(securityHeaders);
    app.use(requestSizeLimit);
    app.use(sanitizeInput);
    app.use(rateLimiter);

    // CORS configuration
    app.use(cors(corsConfig));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session configuration
    app.use(session({
        secret: securityConfig.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: config.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }) as unknown as import('express').RequestHandler);

    app.use(passport.initialize());
    app.use(passport.session());

    // Request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        logRequest(req, res, (req as any).user?.id);
        next();
    });

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.NODE_ENV,
            version: '1.0.0'
        });
    });

    // Signup endpoint with validation and rate limiting
    app.post('/signup', authRateLimiter, validateInput(validationSchemas.signup), (req: Request, res: Response) => {
        signup(req, res).catch((err: any) => {
            logError('Signup failed', err, { email: req.body.email });
            res.status(500).json({ error: err.message || 'Signup failed' });
        });
    });

    // Email verification endpoint
    app.get('/verify-email', (req: Request, res: Response) => {
        (async () => {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Verification token is required.' });
            }
            const result = await handleEmailVerification(token);
            if (result.success) {
                return res.json({ message: result.message });
            } else {
                return res.status(400).json({ error: result.message });
            }
        })().catch((err: any) => {
            res.status(500).json({ error: err.message || 'Verification failed' });
        });
    });

    // Login endpoint with validation and rate limiting
    app.post('/login', authRateLimiter, validateInput(validationSchemas.login), (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
            if (err) {
                logError('Login error', err, { email: req.body.email });
                return next(err);
            }
            if (!user) {
                logInfo('Login failed', { email: req.body.email, reason: info?.message });
                return res.status(400).json({ error: info?.message || 'Login failed' });
            }
            const token = generateToken(user);
            logInfo('Login successful', { userId: user.id, email: user.email });
            return res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, email: user.email, username: user.username, emailVerified: user.emailVerified }
            });
        })(req, res, next);
    });

    // Forgot password endpoint
    app.post('/forgot-password', passwordResetRateLimiter, async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const token = generatePasswordResetToken(email);
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await prisma.user.update({
                where: { email },
                data: {
                    resetPasswordToken: token,
                    resetPasswordTokenExpires: expires,
                },
            });
            await sendPasswordResetEmail(email, token);
        } else {
            console.log(`[ForgotPassword] No user found for email: ${email}`);
        }
        // Always respond with success to prevent email enumeration
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    });

    // Reset password endpoint
    app.post('/reset-password', passwordResetRateLimiter, async (req: Request, res: Response) => {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }
        let payload: any;
        try {
            payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user || user.resetPasswordToken !== token || !user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email: payload.email },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null,
            },
        });
        res.json({ message: 'Password has been reset. You can now log in.' });
    });

    // Get frontend URL from config
    const FRONTEND_URL = config.FRONTEND_URL || 'http://localhost:3010';

    // Google OAuth routes
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
        (req: Request, res: Response) => {
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}/login`);
            }
            const token = generateToken(req.user as any);
            res.redirect(`/auth-success?token=${token}`);
        }
    );

    // GitHub OAuth routes
    app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

    app.get('/auth/github/callback',
        passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
        (req: Request, res: Response) => {
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}/login`);
            }
            const token = generateToken(req.user as any);
            res.redirect(`/auth-success?token=${token}`);
        }
    );

    // Facebook OAuth routes
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
        (req: Request, res: Response) => {
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}/login`);
            }
            const token = generateToken(req.user as any);
            res.redirect(`/auth-success?token=${token}`);
        }
    );

    // Auth success page (for OAuth redirects)
    // app.get('/auth-success', (req: Request, res: Response) => {
    //     const { token } = req.query;
    //     console.log(`Auth success handled on servertoken: ${token}`);
    //     res.json({
    //         message: 'Authentication successful',
    //         token,
    //         redirectUrl: '/dashboard' // Frontend can redirect here
    //     });
    // });

    // Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // context is set in expressMiddleware below
    });

    await server.start();
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }: { req: Request }) => {
                const authHeader = req?.headers?.authorization;
                const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                    ? authHeader.replace('Bearer ', '')
                    : undefined;
                const user = token ? await getUserFromToken(token) : null;
                return { prisma, user };
            },
        })
    );

    // Create HTTP server
    const httpServer = createServer(app);

    // Create WebSocket server for subscriptions
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    // Set up GraphQL WebSocket server
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    useServer(
        {
            schema,
            context: async (ctx) => {
                const authHeader = ctx.connectionParams?.authorization;
                const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                    ? authHeader.replace('Bearer ', '')
                    : undefined;
                const user = token ? await getUserFromToken(token) : null;
                return { prisma, user };
            },
        },
        wsServer
    );

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../../client/build')));

    // Catch-all route to serve index.html for SPA routing
    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });

    // Error handling middleware (must be last)
    app.use(errorHandler);

    const PORT = config.PORT;
    httpServer.listen(PORT, () => {
        logInfo(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        logInfo(`🔌 WebSocket server ready at ws://localhost:${PORT}/graphql`);
        logInfo(`REST endpoints available at http://localhost:${PORT}/signup and /login`);
        logInfo(`Environment: ${config.NODE_ENV}`);
    });
}

startServer().catch((err) => {
    logError('Server failed to start', err);
    process.exit(1);
});