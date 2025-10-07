import type { RedisOptions } from 'ioredis';
import type { ConfigService } from '@nestjs/config';
import { REDIS, CACHE_TTL } from '@shared/config/constants.config';

/**
 * Redis Configuration Factory
 * Creates Redis connection options from environment configuration
 */
export class RedisConfig {
  static createOptions(configService: ConfigService): RedisOptions {
    const password = configService.get<string>('REDIS_PASSWORD', '');

    const options: RedisOptions = {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: +configService.get<number>('REDIS_PORT', 6379),
      db: +configService.get<number>('REDIS_DB', 0),
      retryStrategy: (times: number) => {
        // Exponential backoff with configurable delays
        const delay = Math.min(times * REDIS.RETRY_BASE_DELAY, REDIS.RETRY_MAX_DELAY);
        return delay;
      },
      maxRetriesPerRequest: REDIS.MAX_RETRIES_PER_REQUEST,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      lazyConnect: false,
      // Connection timeout
      connectTimeout: REDIS.CONNECTION_TIMEOUT,
      // Keep alive
      keepAlive: REDIS.KEEP_ALIVE_INTERVAL,
      // Auto-reconnect
      autoResubscribe: true,
      autoResendUnfulfilledCommands: true,
    };

    // Only add password if it exists
    if (typeof password === 'string' && password.trim() !== '') {
      options.password = password;
    }

    return options;
  }

  /**
   * Get default TTL from config or use constant default
   */
  static getDefaultTTL(configService: ConfigService<Record<string, unknown>, false>): number {
    const ttl = configService.get<number>('REDIS_TTL');
    return ttl ?? CACHE_TTL.DEFAULT;
  }

  /**
   * Check if Redis is enabled
   */
  static isEnabled(configService: ConfigService<Record<string, unknown>, false>): boolean {
    const enabled = configService.get<boolean>('REDIS_ENABLED');
    return enabled ?? true;
  }
}
