import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { ICache } from '@shared/domain/cache';
import { Result } from '@shared/domain/specification';
import { RedisConfig } from './redis.config';

/**
 * Redis Cache Implementation
 *
 * Production-ready Redis cache service with:
 * - Connection management and health checks
 * - Error handling and recovery
 * - Serialization/deserialization
 * - Monitoring and logging
 * - Type-safe operations
 */
@Injectable()
export class RedisCacheService implements ICache, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis!: Redis;
  private readonly defaultTTL: number;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.defaultTTL = RedisConfig.getDefaultTTL(configService);
    this.isEnabled = RedisConfig.isEnabled(configService);

    if (this.isEnabled) {
      const options = RedisConfig.createOptions(configService);
      this.redis = new Redis(options);

      // Setup event handlers
      this.setupEventHandlers();
    } else {
      this.logger.warn('Redis cache is disabled');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.redis.ping();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  async get<T>(key: string): Promise<Result<T | null>> {
    if (!this.isEnabled) {
      return Result.ok(null);
    }

    try {
      const value = await this.redis.get(key);

      if (value == null) {
        this.logger.debug(`Cache miss: ${key}`);
        return Result.ok(null);
      }

      const deserialized = this.deserialize<T>(value);
      this.logger.debug(`Cache hit: ${key}`);
      return Result.ok(deserialized);
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_GET_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    if (!this.isEnabled) {
      return Result.ok();
    }

    try {
      const serialized = this.serialize(value);
      const expiry = ttl ?? this.defaultTTL;

      if (expiry > 0) {
        await this.redis.setex(key, expiry, serialized);
      } else {
        await this.redis.set(key, serialized);
      }

      this.logger.debug(`Cache set: ${key} (TTL: ${expiry}s)`);
      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_SET_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  async delete(key: string): Promise<Result<void>> {
    if (!this.isEnabled) {
      return Result.ok();
    }

    try {
      await this.redis.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_DELETE_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  async deleteMany(keys: string[]): Promise<Result<void>> {
    if (!this.isEnabled || keys.length === 0) {
      return Result.ok();
    }

    try {
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      this.logger.debug(`Cache deleted ${keys.length} keys`);
      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to delete multiple cache keys:`, error);
      return Result.fail({
        errorKey: 'CACHE_DELETE_MANY_ERROR',
        errorParam: { count: keys.length, error: this.extractErrorMessage(error) },
      });
    }
  }

  async exists(key: string): Promise<Result<boolean>> {
    if (!this.isEnabled) {
      return Result.ok(false);
    }

    try {
      const exists = (await this.redis.exists(key)) === 1;
      return Result.ok(exists);
    } catch (error) {
      this.logger.error(`Failed to check cache key existence ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_EXISTS_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  async clear(): Promise<Result<void>> {
    if (!this.isEnabled) {
      return Result.ok();
    }

    try {
      await this.redis.flushdb();
      this.logger.warn('Cache cleared (FLUSHDB)');
      return Result.ok();
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
      return Result.fail({
        errorKey: 'CACHE_CLEAR_ERROR',
        errorParam: { error: this.extractErrorMessage(error) },
      });
    }
  }

  async getMany<T>(keys: string[]): Promise<Result<Record<string, T | null>>> {
    if (!this.isEnabled || keys.length === 0) {
      return Result.ok({});
    }

    try {
      const values = await this.redis.mget(...keys);

      const result: Record<string, T | null> = {};
      keys.forEach((key, index) => {
        const value = values[index];
        result[key] = value != null ? this.deserialize<T>(value) : null;
      });

      this.logger.debug(`Cache getMany: ${keys.length} keys`);
      return Result.ok(result);
    } catch (error) {
      this.logger.error('Failed to get multiple cache keys:', error);
      return Result.fail({
        errorKey: 'CACHE_GET_MANY_ERROR',
        errorParam: { count: keys.length, error: this.extractErrorMessage(error) },
      });
    }
  }

  async setMany<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>> {
    if (!this.isEnabled || Object.keys(entries).length === 0) {
      return Result.ok();
    }

    try {
      const pipeline = this.redis.pipeline();
      const expiry = ttl ?? this.defaultTTL;

      for (const [key, value] of Object.entries(entries)) {
        const serialized = this.serialize(value);
        if (expiry > 0) {
          pipeline.setex(key, expiry, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }

      await pipeline.exec();
      this.logger.debug(`Cache setMany: ${Object.keys(entries).length} keys (TTL: ${expiry}s)`);
      return Result.ok();
    } catch (error) {
      this.logger.error('Failed to set multiple cache keys:', error);
      return Result.fail({
        errorKey: 'CACHE_SET_MANY_ERROR',
        errorParam: { count: Object.keys(entries).length, error: this.extractErrorMessage(error) },
      });
    }
  }

  async setWithExpiry<T>(key: string, value: T, ttl: number): Promise<Result<void>> {
    return this.set(key, value, ttl);
  }

  async keys(pattern: string): Promise<Result<string[]>> {
    if (!this.isEnabled) {
      return Result.ok([]);
    }

    try {
      const keys = await this.redis.keys(pattern);
      this.logger.debug(`Cache keys matching pattern ${pattern}: ${keys.length} found`);
      return Result.ok(keys);
    } catch (error) {
      this.logger.error(`Failed to get cache keys with pattern ${pattern}:`, error);
      return Result.fail({
        errorKey: 'CACHE_KEYS_ERROR',
        errorParam: { pattern, error: this.extractErrorMessage(error) },
      });
    }
  }

  /**
   * Advanced: Increment counter
   */
  async increment(key: string, amount = 1): Promise<Result<number>> {
    if (!this.isEnabled) {
      return Result.ok(0);
    }

    try {
      const value = await this.redis.incrby(key, amount);
      return Result.ok(value);
    } catch (error) {
      this.logger.error(`Failed to increment cache key ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_INCREMENT_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  /**
   * Advanced: Decrement counter
   */
  async decrement(key: string, amount = 1): Promise<Result<number>> {
    if (!this.isEnabled) {
      return Result.ok(0);
    }

    try {
      const value = await this.redis.decrby(key, amount);
      return Result.ok(value);
    } catch (error) {
      this.logger.error(`Failed to decrement cache key ${key}:`, error);
      return Result.fail({
        errorKey: 'CACHE_DECREMENT_ERROR',
        errorParam: { key, error: this.extractErrorMessage(error) },
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled) {
      return true;
    }

    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Private: Setup event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.logger.log('Redis connecting...');
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis ready');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis error:', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', (delay: number) => {
      this.logger.log(`Redis reconnecting in ${delay}ms...`);
    });

    this.redis.on('end', () => {
      this.logger.log('Redis connection ended');
    });
  }

  /**
   * Private: Serialize value to string
   */
  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  /**
   * Private: Deserialize string to value
   */
  private deserialize<T>(value: string): T {
    return JSON.parse(value) as T;
  }

  /**
   * Private: Extract error message
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
