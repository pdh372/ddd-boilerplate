import type { RedisOptions } from 'ioredis';
import type { ConfigService } from '@nestjs/config';

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
        // Exponential backoff: 50ms, 100ms, 200ms, ..., max 3000ms
        const delay = Math.min(times * 50, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      lazyConnect: false,
      // Connection timeout
      connectTimeout: 10000,
      // Keep alive
      keepAlive: 30000,
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
   * Get default TTL from config
   */
  static getDefaultTTL(configService: ConfigService<Record<string, unknown>, false>): number {
    const ttl = configService.get<number>('REDIS_TTL');
    return ttl ?? 3600;
  }

  /**
   * Check if Redis is enabled
   */
  static isEnabled(configService: ConfigService<Record<string, unknown>, false>): boolean {
    const enabled = configService.get<boolean>('REDIS_ENABLED');
    return enabled ?? true;
  }
}
