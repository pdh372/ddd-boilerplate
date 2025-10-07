import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/app';
import type { IUserRepository } from '@module/user/domain/repo';
import type { UserAggregate } from '@module/user/domain/aggregate';
import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';
import type { ICache } from '@shared/domain/cache';
import { USER_REPOSITORY } from '@module/user/user.token';
import { CACHE_SERVICE } from '@infra/cache';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IGetUserWithCacheDto {
  userId: string;
  bypassCache?: boolean;
}

/**
 * Get User Use Case with Redis Cache
 *
 * Demonstrates cache-aside pattern:
 * 1. Try to get from cache first
 * 2. If cache miss, get from database
 * 3. Store in cache for next request
 * 4. Return result
 *
 * Cache invalidation happens on user updates
 */
@Injectable()
export class GetUserWithCacheUseCase implements UseCase<IGetUserWithCacheDto, UserAggregate> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICache,
  ) {}

  async execute(input: IGetUserWithCacheDto): Promise<ResultSpecification<UserAggregate>> {
    // 1. Validate input
    const userIdResult = IdVO.validate(input.userId);
    if (userIdResult.isFailure) {
      return ResultSpecification.fail(userIdResult.error);
    }

    const userId = userIdResult.getValue;
    const cacheKey = this.buildCacheKey(userId.value);

    // 2. Try cache first (unless bypassed)
    if (input.bypassCache !== true) {
      const cachedResult = await this.cacheService.get<UserAggregate>(cacheKey);

      if (cachedResult.isSuccess && cachedResult.getValue !== null) {
        // Cache hit - return cached data
        return ResultSpecification.ok(cachedResult.getValue);
      }
    }

    // 3. Cache miss - get from database
    const userResult = await this.userRepository.findById(userId);
    if (userResult.isFailure) {
      return ResultSpecification.fail(userResult.error);
    }

    const user = userResult.getValue;
    if (!user) {
      return ResultSpecification.fail({ errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND });
    }

    // 4. Store in cache for next request (30 minutes TTL)
    await this.cacheService.set(cacheKey, user, 1800);

    return ResultSpecification.ok(user);
  }

  /**
   * Build cache key for user
   * Centralized key generation for consistency
   */
  private buildCacheKey(userId: string): string {
    return `user:${userId}`;
  }
}
