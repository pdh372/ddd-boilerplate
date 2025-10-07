import { Module } from '@nestjs/common';
import { UserModule } from './web/user/user.module';
import { OrderModule } from './web/order/order.module';
import { DatabaseInfra } from '@infra/database/database.factory';
import { ConfigModule } from '@shared/config';
import { CacheModule } from '@infra/cache';
import { SharedAppModule } from '@shared/app/app.module';

@Module({
  imports: [
    // Config
    ConfigModule,

    // Shared Application Services (DomainEventService, TransactionService)
    SharedAppModule,

    // Infra
    DatabaseInfra,
    CacheModule, // Redis Cache

    // Modules
    UserModule,
    OrderModule,
  ],
})
export class AppModule {}
