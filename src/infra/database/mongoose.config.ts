import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema, UserMongooseRepository } from '../repo/mongoose/user.repo';
import { OrderDocument, OrderSchema, OrderMongooseRepository } from '../repo/mongoose/order.repo';
import { USER_REPOSITORY } from '@module/user/user.token';
import { ORDER_REPOSITORY } from '@module/order/order.token';
import { EventInfraModule } from '../event/event.module';
import { ConfigModule, ConfigService } from '@shared/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.database.mongodb.uri,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: OrderDocument.name, schema: OrderSchema },
    ]),
    EventInfraModule,
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserMongooseRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderMongooseRepository,
    },
  ],
  exports: [USER_REPOSITORY, ORDER_REPOSITORY, EventInfraModule],
})
export class MongooseDatabaseModule {}
