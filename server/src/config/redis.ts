import Redis from 'ioredis';
import { config } from './index';
import { logError, logInfo } from '../utils/logger';

// Create Redis client with fallback handling
export const redisClient = new Redis(config.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Handle Redis connection events
redisClient.on('connect', () => {
  logInfo('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  logError('❌ Redis client error:', err);
  logInfo('⚠️  Sessions will fall back to memory store');
});

redisClient.on('close', () => {
  logInfo('🔌 Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logInfo('🔄 Redis client reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logInfo('🛑 Shutting down Redis client...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logInfo('🛑 Shutting down Redis client...');
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;
