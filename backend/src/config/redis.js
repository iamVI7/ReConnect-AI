import Redis from 'ioredis';
import { env } from './env.js';

export const redisClient = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null, // required by BullMQ
});

redisClient.on('connect', () => console.log('[redis] connected'));
redisClient.on('error', (err) => console.error('[redis] error:', err.message));
