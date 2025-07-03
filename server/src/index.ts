import dotenv from 'dotenv';
dotenv.config();
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
import { handleEmailVerification } from './auth/email';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';

const prisma = new PrismaClient();

async function startServer() {
    // Set up Express
    const app = express();

    // CORS configuration
    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3010'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());
    app.use(session({ secret: process.env.SESSION_SECRET || 'b7f8e2c9-4a1d-4e2a-8c3e-2f7b8e2c9a1d-4e2a-8c3e-2f7b8e2c9a1d', resave: false, saveUninitialized: false }) as unknown as import('express').RequestHandler);
    app.use(passport.initialize());
    app.use(passport.session());

    // Signup endpoint
    app.post('/signup', (req: Request, res: Response) => {
        signup(req, res).catch((err: any) => {
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

    // Login endpoint
    app.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ error: info?.message || 'Login failed' });
            const token = generateToken(user);
            return res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, email: user.email, username: user.username }
            });
        })(req, res, next);
    });

    // Get frontend URL from env or default
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';

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

    const PORT = 4010;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/graphql`);
        console.log(`REST endpoints available at http://localhost:${PORT}/signup and /login`);
    });
}

startServer().catch((err) => {
    console.error('Server failed to start', err);
});