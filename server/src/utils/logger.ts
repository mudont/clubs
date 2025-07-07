import winston from 'winston';
import { config, isProduction } from '../config';

// Define custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create transports
const transports = [];

// Console transport
transports.push(
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat,
    level: isProduction ? 'info' : 'debug',
  })
);

// File transports for production
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: isProduction ? 'info' : 'debug',
  transports,
  exitOnError: false,
});

// Stream for Morgan HTTP logging
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...meta,
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Performance logging utility
export const logPerformance = (
  operation: string,
  duration: number,
  meta?: any
) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration.toFixed(2)}ms`,
    ...meta,
  });
};

// Database query logging
export const logQuery = (query: string, duration: number, meta?: any) => {
  logger.debug(`Database Query: ${query}`, {
    duration: `${duration.toFixed(2)}ms`,
    ...meta,
  });
};

// Security event logging
export const logSecurityEvent = (event: string, meta?: any) => {
  logger.warn(`Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

// Request logging middleware
export const logRequest = (req: any, res: any, userId?: string) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logHttp(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
  });
};

export default logger; 