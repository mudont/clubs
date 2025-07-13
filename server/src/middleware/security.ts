import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Joi from 'joi';
import { isDevelopment, rateLimitConfig } from '../config';
import { logError, logSecurityEvent } from '../utils/logger';

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: rateLimitConfig.message,
  standardHeaders: rateLimitConfig.standardHeaders,
  legacyHeaders: rateLimitConfig.legacyHeaders,
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
    });
    res.status(429).json({ error: rateLimitConfig.message });
  },
});

// Strict rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 50, // More lenient in development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
    });
    res.status(429).json({ error: 'Too many authentication attempts, please try again later.' });
  },
});

// Password reset rate limiting
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 50 : 10, // More lenient in development
  message: 'Too many password reset requests, please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
    });
    res.status(429).json({ error: 'Too many password reset requests, please try again in an hour.' });
  },
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation schemas
export const validationSchemas = {
  signup: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    username: Joi.string()
      .min(3)
      .max(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be at most 20 characters long',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'any.required': 'Username is required',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  createGroup: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Group name must be at least 3 characters long',
      'string.max': 'Group name must be at most 100 characters long',
      'any.required': 'Group name is required',
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Group description must be at most 1000 characters long',
    }),
  }),

  createEvent: Joi.object({
    groupId: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid group ID format',
      'any.required': 'Group ID is required',
    }),
    date: Joi.date().greater('now').required().messages({
      'date.greater': 'Event date must be in the future',
      'any.required': 'Event date is required',
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Event description must be at least 10 characters long',
      'string.max': 'Event description must be at most 500 characters long',
      'any.required': 'Event description is required',
    }),
  }),

  sendMessage: Joi.object({
    groupId: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid group ID format',
      'any.required': 'Group ID is required',
    }),
    content: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message must be at most 1000 characters long',
      'any.required': 'Message content is required',
    }),
  }),

  updateProfile: Joi.object({
    username: Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9_]+$/).optional().messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 20 characters long',
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    }),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
    firstName: Joi.string().max(50).optional().messages({
      'string.max': 'First name must be at most 50 characters long',
    }),
    lastName: Joi.string().max(50).optional().messages({
      'string.max': 'Last name must be at most 50 characters long',
    }),
    bio: Joi.string().max(500).optional().messages({
      'string.max': 'Bio must be at most 500 characters long',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
  }),
};

// Validation middleware factory
export const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logSecurityEvent('Input validation failed', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        url: req.originalUrl,
        error: error.details[0].message,
      });
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message,
      });
    }
    next();
  };
};

// Request sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  // Mutate req.query in place
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitize(req.query[key]);
    });
  }
  // Mutate req.params in place
  if (req.params && typeof req.params === 'object') {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitize(req.params[key]);
    });
  }
  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Unhandled error', err, {
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // GraphQL errors
  if (err.name === 'GraphQLError') {
    return res.status(400).json({
      error: 'GraphQL Error',
      message: err.message,
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  // Database errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while processing your request',
    });
  }

  // Authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token',
    });
  }

  // Default error response
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
};

// Request size limit middleware
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    logSecurityEvent('Request size limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
      size: contentLength,
    });
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds maximum limit',
    });
  }

  next();
};
