import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

export const createRateLimiter = (redis: Redis) => {
  const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60, // Block for 60 seconds if exceeded
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      await rateLimiter.consume(key);
      next();
    } catch (error) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }
  };
};
