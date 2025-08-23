import winston from 'winston';
import {
  logDebug,
  logError,
  logHttp,
  logInfo,
  logPerformance,
  logQuery,
  logRequest,
  logSecurityEvent,
  logWarn,
  logger,
} from '../../../utils/logger';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
  addColors: jest.fn(),
}));

describe('Logger Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('should log error with message only', () => {
      const message = 'Test error message';
      logError(message);

      expect(logger.error).toHaveBeenCalledWith(message, {
        error: undefined,
        stack: undefined,
      });
    });

    it('should log error with Error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      logError(message, error);

      expect(logger.error).toHaveBeenCalledWith(message, {
        error: error.message,
        stack: error.stack,
      });
    });

    it('should log error with metadata', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const meta = { userId: '123', action: 'test' };

      logError(message, error, meta);

      expect(logger.error).toHaveBeenCalledWith(message, {
        error: error.message,
        stack: error.stack,
        userId: '123',
        action: 'test',
      });
    });

    it('should handle error without Error object', () => {
      const message = 'Test error message';
      const meta = { context: 'test' };

      logError(message, undefined, meta);

      expect(logger.error).toHaveBeenCalledWith(message, {
        error: undefined,
        stack: undefined,
        context: 'test',
      });
    });
  });

  describe('logInfo', () => {
    it('should log info message', () => {
      const message = 'Test info message';
      logInfo(message);

      expect(logger.info).toHaveBeenCalledWith(message, undefined);
    });

    it('should log info message with metadata', () => {
      const message = 'Test info message';
      const meta = { userId: '123' };

      logInfo(message, meta);

      expect(logger.info).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logWarn', () => {
    it('should log warning message', () => {
      const message = 'Test warning message';
      logWarn(message);

      expect(logger.warn).toHaveBeenCalledWith(message, undefined);
    });

    it('should log warning message with metadata', () => {
      const message = 'Test warning message';
      const meta = { component: 'auth' };

      logWarn(message, meta);

      expect(logger.warn).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logDebug', () => {
    it('should log debug message', () => {
      const message = 'Test debug message';
      logDebug(message);

      expect(logger.debug).toHaveBeenCalledWith(message, undefined);
    });

    it('should log debug message with metadata', () => {
      const message = 'Test debug message';
      const meta = { step: 'validation' };

      logDebug(message, meta);

      expect(logger.debug).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logHttp', () => {
    it('should log HTTP message', () => {
      const message = 'HTTP request';
      logHttp(message);

      expect(logger.http).toHaveBeenCalledWith(message, undefined);
    });

    it('should log HTTP message with metadata', () => {
      const message = 'HTTP request';
      const meta = { method: 'GET', url: '/api/test' };

      logHttp(message, meta);

      expect(logger.http).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logPerformance', () => {
    it('should log performance metrics', () => {
      const operation = 'database query';
      const duration = 150.5;

      logPerformance(operation, duration);

      expect(logger.info).toHaveBeenCalledWith(`Performance: ${operation}`, {
        duration: '150.50ms',
      });
    });

    it('should log performance metrics with metadata', () => {
      const operation = 'API call';
      const duration = 250.75;
      const meta = { endpoint: '/api/users' };

      logPerformance(operation, duration, meta);

      expect(logger.info).toHaveBeenCalledWith(`Performance: ${operation}`, {
        duration: '250.75ms',
        endpoint: '/api/users',
      });
    });

    it('should format duration correctly', () => {
      const operation = 'test operation';

      logPerformance(operation, 1);
      expect(logger.info).toHaveBeenCalledWith(`Performance: ${operation}`, {
        duration: '1.00ms',
      });

      logPerformance(operation, 1.234);
      expect(logger.info).toHaveBeenCalledWith(`Performance: ${operation}`, {
        duration: '1.23ms',
      });
    });
  });

  describe('logQuery', () => {
    it('should log database query', () => {
      const query = 'SELECT * FROM users';
      const duration = 50.25;

      logQuery(query, duration);

      expect(logger.debug).toHaveBeenCalledWith(`Database Query: ${query}`, {
        duration: '50.25ms',
      });
    });

    it('should log database query with metadata', () => {
      const query = 'SELECT * FROM users WHERE id = ?';
      const duration = 25.5;
      const meta = { params: ['123'] };

      logQuery(query, duration, meta);

      expect(logger.debug).toHaveBeenCalledWith(`Database Query: ${query}`, {
        duration: '25.50ms',
        params: ['123'],
      });
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security event', () => {
      const event = 'Failed login attempt';

      logSecurityEvent(event);

      expect(logger.warn).toHaveBeenCalledWith(`Security Event: ${event}`, {
        timestamp: expect.any(String),
      });
    });

    it('should log security event with metadata', () => {
      const event = 'Suspicious activity detected';
      const meta = { ip: '192.168.1.1', userId: '123' };

      logSecurityEvent(event, meta);

      expect(logger.warn).toHaveBeenCalledWith(`Security Event: ${event}`, {
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        userId: '123',
      });
    });

    it('should include ISO timestamp', () => {
      const event = 'Test security event';

      logSecurityEvent(event);

      const call = (logger.warn as jest.Mock).mock.calls[0];
      const metadata = call[1];

      expect(metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('logRequest', () => {
    it('should log request with basic information', () => {
      const mockReq = {
        method: 'GET',
        originalUrl: '/api/test',
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
      };

      const mockRes = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // Simulate response finish after 100ms
            setTimeout(callback, 100);
          }
        }),
      };

      logRequest(mockReq, mockRes);

      // Trigger the finish event
      const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith('GET /api/test', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        duration: expect.stringMatching(/^\d+ms$/),
        userId: undefined,
        userAgent: 'test-agent',
        ip: '127.0.0.1',
      });
    });

    it('should log request with user ID', () => {
      const mockReq = {
        method: 'POST',
        originalUrl: '/api/users',
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '192.168.1.1',
      };

      const mockRes = {
        statusCode: 201,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(callback, 50);
          }
        }),
      };

      const userId = 'user-123';

      logRequest(mockReq, mockRes, userId);

      // Trigger the finish event
      const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith('POST /api/users', {
        method: 'POST',
        url: '/api/users',
        statusCode: 201,
        duration: expect.stringMatching(/^\d+ms$/),
        userId: 'user-123',
        userAgent: 'test-agent',
        ip: '192.168.1.1',
      });
    });

    it('should handle missing user agent', () => {
      const mockReq = {
        method: 'GET',
        originalUrl: '/api/test',
        get: jest.fn().mockReturnValue(undefined),
        ip: '127.0.0.1',
      };

      const mockRes = {
        statusCode: 404,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        }),
      };

      logRequest(mockReq, mockRes);

      const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith('GET /api/test', {
        method: 'GET',
        url: '/api/test',
        statusCode: 404,
        duration: expect.stringMatching(/^\d+ms$/),
        userId: undefined,
        userAgent: undefined,
        ip: '127.0.0.1',
      });
    });
  });

  describe('Logger Configuration', () => {
    it('should create logger with winston', () => {
      expect(winston.createLogger).toHaveBeenCalled();
    });

    it('should add colors to winston', () => {
      expect(winston.addColors).toHaveBeenCalled();
    });

    it('should configure transports', () => {
      expect(winston.transports.Console).toHaveBeenCalled();
    });

    it('should configure formats', () => {
      expect(winston.format.combine).toHaveBeenCalled();
      expect(winston.format.timestamp).toHaveBeenCalled();
      expect(winston.format.errors).toHaveBeenCalled();
    });
  });
});
