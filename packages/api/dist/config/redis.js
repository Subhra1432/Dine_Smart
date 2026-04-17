// ═══════════════════════════════════════════
// DineSmart OS — Redis Client Configuration
// ═══════════════════════════════════════════
import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';
export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
redis.on('connect', () => {
    logger.info('✅ Redis connected');
});
redis.on('error', (err) => {
    logger.error('❌ Redis connection error:', err);
});
export const redisPub = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});
export const redisSub = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});
export default redis;
//# sourceMappingURL=redis.js.map