import { Inject, Injectable } from '@nestjs/common';
import type { ICache } from '@shared/domain/cache';
import { CACHE_SERVICE } from '@infra/cache';
import { Result } from '@shared/domain/specification';

/**
 * Cache Invalidation Service
 *
 * Handles cache invalidation patterns across the application
 * Centralizes cache key management and invalidation logic
 */
@Injectable()
export class CacheInvalidationService {
  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICache,
  ) {}

  /**
   * Invalidate user cache
   * Call this after user update/delete operations
   */
  async invalidateUser(userId: string): Promise<Result<void>> {
    const keys = [
      `user:${userId}`,
      `user:${userId}:orders`, // Also invalidate user's orders cache
    ];

    return this.cacheService.deleteMany(keys);
  }

  /**
   * Invalidate order cache
   * Call this after order update/delete operations
   */
  async invalidateOrder(orderId: string): Promise<Result<void>> {
    return this.cacheService.delete(`order:${orderId}`);
  }

  /**
   * Invalidate user's orders cache
   * Call this when user creates/modifies orders
   */
  async invalidateUserOrders(userId: string): Promise<Result<void>> {
    return this.cacheService.delete(`user:${userId}:orders`);
  }

  /**
   * Invalidate all user-related caches
   */
  async invalidateAllUserCaches(userId: string): Promise<Result<void>> {
    const pattern = `user:${userId}*`;
    const keysResult = await this.cacheService.keys(pattern);

    if (keysResult.isFailure) {
      return Result.fail(keysResult.error);
    }

    const keys = keysResult.getValue;
    if (keys.length === 0) {
      return Result.ok();
    }

    return this.cacheService.deleteMany(keys);
  }

  /**
   * Invalidate event store cache for aggregate
   */
  async invalidateAggregateEvents(aggregateId: string, aggregateType: string): Promise<Result<void>> {
    return this.cacheService.delete(`events:${aggregateType}:${aggregateId}`);
  }
}
