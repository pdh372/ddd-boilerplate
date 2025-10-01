import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';

/**
 * Cache Token for Dependency Injection
 */
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

/**
 * Cache Module
 *
 * Provides Redis cache service as a global module
 * Can be injected anywhere using CACHE_SERVICE token
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
