import { Module } from '@nestjs/common';
import { UserModule } from './web/user/user.module';
import { OrderModule } from './web/order/order.module';
import { DatabaseInfra } from '@infra/database/database.factory';
import { ConfigModule } from '@shared/config';

@Module({
  imports: [
    // Config
    ConfigModule,

    // Infra
    DatabaseInfra,

    // Modules
    UserModule,
    OrderModule,
  ],
})
export class AppModule {}
