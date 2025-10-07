import type { Result } from '../specification';

/**
 * Cache Interface - Domain layer abstraction
 *
 * Provides cache operations without coupling to specific implementation
 * Follows DDD principle: Domain defines interfaces, Infrastructure implements
 */
export interface ICache {
  /**
   * Get value from cache
   * @param key Cache key
   * @returns Result containing cached value or null if not found
   */
  get<T>(key: string): Promise<Result<T | null>>;

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds (optional, uses default if not provided)
   * @returns Result indicating success or failure
   */
  set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;

  /**
   * Delete value from cache
   * @param key Cache key
   * @returns Result indicating success or failure
   */
  delete(key: string): Promise<Result<void>>;

  /**
   * Delete multiple keys from cache
   * @param keys Array of cache keys
   * @returns Result indicating success or failure
   */
  deleteMany(keys: string[]): Promise<Result<void>>;

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns Result containing boolean indicating existence
   */
  exists(key: string): Promise<Result<boolean>>;

  /**
   * Clear all cache entries (use with caution)
   * @returns Result indicating success or failure
   */
  clear(): Promise<Result<void>>;

  /**
   * Get multiple values from cache
   * @param keys Array of cache keys
   * @returns Result containing record of key-value pairs
   */
  getMany<T>(keys: string[]): Promise<Result<Record<string, T | null>>>;

  /**
   * Set multiple values in cache
   * @param entries Record of key-value pairs
   * @param ttl Time-to-live in seconds (optional)
   * @returns Result indicating success or failure
   */
  setMany<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>>;

  /**
   * Set value with expiration time (alias for set with ttl)
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds
   * @returns Result indicating success or failure
   */
  setWithExpiry<T>(key: string, value: T, ttl: number): Promise<Result<void>>;

  /**
   * Get keys matching pattern
   * @param pattern Pattern to match (Redis pattern syntax)
   * @returns Result containing array of matching keys
   */
  keys(pattern: string): Promise<Result<string[]>>;
}

/**
 * Cache key builder helper
 * Provides consistent cache key generation across the application
 */
export class CacheKeyBuilder {
  /**
   * Build cache key for user
   * @param userId User ID
   * @returns Cache key
   */
  static user(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Build cache key for order
   * @param orderId Order ID
   * @returns Cache key
   */
  static order(orderId: string): string {
    return `order:${orderId}`;
  }

  /**
   * Build cache key for user's orders
   * @param userId User ID
   * @returns Cache key
   */
  static userOrders(userId: string): string {
    return `user:${userId}:orders`;
  }

  /**
   * Build cache key for aggregate event stream
   * @param aggregateId Aggregate ID
   * @param aggregateType Aggregate type
   * @returns Cache key
   */
  static aggregateEvents(aggregateId: string, aggregateType: string): string {
    return `events:${aggregateType}:${aggregateId}`;
  }

  /**
   * Build custom cache key
   * @param parts Key parts to join
   * @returns Cache key
   */
  static custom(...parts: string[]): string {
    return parts.join(':');
  }

  /**
   * Build pattern for keys
   * @param prefix Prefix pattern
   * @returns Pattern for key matching
   */
  static pattern(prefix: string): string {
    return `${prefix}*`;
  }
}
