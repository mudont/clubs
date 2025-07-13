import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { generatePasswordResetToken, handleEmailVerification, sendPasswordResetEmail } from './auth/email';
import { generateToken, getUserFromToken } from './auth/jwt';
import { signup } from './auth/local';
import passport from './auth/passport';
import { config, corsConfig, securityConfig } from './config';
import { redisClient } from './config/redis';
import {
  authRateLimiter,
  passwordResetRateLimiter,
  rateLimiter,
  requestSizeLimit,
  sanitizeInput,
  securityHeaders,
  validateInput,
  validationSchemas
} from './middleware/security';
import { pubsub } from './pubsub';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { logError, logInfo, logRequest } from './utils/logger';

const prisma = new PrismaClient();

async function startServer() {
  // Set up Express
  const app = express();
  app.set('trust proxy', true); // Trust X-Forwarded-For header for rate limiting and proxies

  // Security middleware
  app.use(securityHeaders);
  app.use(requestSizeLimit);
  app.use(sanitizeInput);
  app.use(rateLimiter);

  // CORS configuration
  app.use(cors(corsConfig));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Redis session store
  let RedisStore: any;
  let sessionStore: any;
  try {
    console.log('🔄 Attempting to initialize Redis session store...');
    console.log('📍 Redis URL:', process.env.REDIS_URL);

    // For connect-redis v9+
    const { RedisStore: RedisStoreClass } = require('connect-redis');
    RedisStore = RedisStoreClass;
    sessionStore = new RedisStore({ client: redisClient });

    console.log('✅ Redis session store initialized successfully.');
  } catch (err) {
    console.warn('⚠️  Redis session store failed to initialize, falling back to memory store');
    console.warn('🔍 Error details:', err);
    sessionStore = undefined;
  }

  // Session configuration with Redis store (fallback to memory if Redis unavailable)
  app.use(session({
    store: sessionStore,
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

  // Serve static files from React build directory
  const staticPath = path.join(__dirname, '../../client/build');
  console.log('📁 Serving static files from:', staticPath);
  app.use(express.static(staticPath));

  // Create HTTP server for GraphQL
  const httpServer = createServer(app);

  // Create WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server for subscriptions
  const serverCleanup = useServer({ schema }, wsServer);

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply Apollo middleware (GraphQL endpoint)
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: async ({ req }: { req: Request }) => {
      // Get user from JWT token
      let user = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          user = await getUserFromToken(token);
        } catch (error) {
          // Token is invalid, but we don't throw here
        }
      }
      return {
        prisma,
        user,
        pubsub,
      };
    },
  }));

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

  // SMTP test endpoint (for debugging)
  app.post('/test-smtp', async (req: Request, res: Response) => {
    try {
      const nodemailer = require('nodemailer');

      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Test connection
      await transporter.verify();

      // Send test email
      const testEmail = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: 'SMTP Test - Groups App',
        html: `
                    <h2>SMTP Test Successful!</h2>
                    <p>This is a test email from your Clubs app server.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Server:</strong> ${config.NODE_ENV}</p>
                `,
      };

      const info = await transporter.sendMail(testEmail);

      res.json({
        success: true,
        message: 'SMTP test successful',
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('SMTP test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        command: error.command,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Signup endpoint with validation and rate limiting
  app.post('/signup', authRateLimiter, validateInput(validationSchemas.signup), (req: Request, res: Response) => {
    signup(req, res).catch((err: any) => {
      logError('Signup failed', err, { email: req.body.email });
      res.status(500).json({ error: err.message || 'Signup failed' });
    });
  });

  // Get frontend URL from config
  const FRONTEND_URL = config.FRONTEND_URL || '';

  // Email verification endpoint
  app.get('/verify-email', (req: Request, res: Response) => {
    (async () => {
      const { token } = req.query;
      console.log('Email verification attempt:', {
        token: token ? 'present' : 'missing',
        frontendUrl: FRONTEND_URL,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer
      });

      if (!token || typeof token !== 'string') {
        console.log('Redirecting to error: invalid token');
        return res.redirect(`/email-verification?error=invalid_token`);
      }

      console.log('Calling handleEmailVerification with token:', token.substring(0, 20) + '...');
      const result = await handleEmailVerification(token);
      console.log('Email verification result:', result);

      if (result.success) {
        console.log('Redirecting to success');
        return res.redirect(`/email-verification?status=success`);
      } else {
        console.log('Redirecting to error:', result.message);
        return res.redirect(`/email-verification?error=${encodeURIComponent(result.message)}`);
      }
    })().catch((err: any) => {
      console.error('Email verification error:', err);
      res.redirect(`/email-verification?error=${encodeURIComponent(err.message || 'Verification failed')}`);
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
  app.post('/reset-password', passwordResetRateLimiter, validateInput(validationSchemas.resetPassword), async (req: Request, res: Response) => {
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

  // Admin: Delete user endpoint
  app.delete('/admin/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.replace('Bearer ', '');
      const currentUser = await getUserFromToken(token);

      if (!currentUser) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // TODO: Implement proper admin role checking
      // For now, we'll allow users to delete themselves
      if (currentUser.id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own account' });
      }

      // Check if user exists
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: true,
          messages: true,
          Event: true,
          RSVP: true,
          accounts: true,
        },
      });

      if (!userToDelete) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete user and all related data (cascade)
      await prisma.user.delete({
        where: { id: userId },
      });

      logInfo('User deleted', { deletedUserId: userId, deletedBy: currentUser.id });
      res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
      logError('Failed to delete user', err, { userId: req.params.userId });
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

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

  // Catch-all route for React app (must be last)
  const serveSPA = (req: Request, res: Response) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Index file not found at:', indexPath);
      return res.status(500).send('Internal Server Error');
    }
    res.sendFile(indexPath);
  };
  app.get('/*splat', serveSPA);

  // Start server
  const PORT = process.env.PORT || 4010;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
