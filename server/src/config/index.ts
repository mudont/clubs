import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envPath = path.resolve(process.cwd(), '.env');
console.log('[dotenv] Loading .env from:', envPath);
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4010'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  REDIS_URL: z.string().optional(),

  // Email configuration
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // OAuth configurations
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Frontend URL
  FRONTEND_URL: z.string().url().optional(),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),

  // Monitoring
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:', parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;

// Export typed config object
export type Config = typeof config;

// Helper function to check if in production
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

// Database configuration
export const databaseConfig = {
  url: config.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

// CORS configuration
export const corsConfig = {
  origin: isProduction
    ? [config.FRONTEND_URL!]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3010', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security configuration
export const securityConfig = {
  bcryptRounds: config.BCRYPT_ROUNDS,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  sessionSecret: config.SESSION_SECRET,
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: isDevelopment ? 1000 : config.RATE_LIMIT_MAX, // More lenient in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};
