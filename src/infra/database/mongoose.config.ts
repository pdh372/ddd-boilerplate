import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema, UserMongooseRepository } from '../repo/mongoose/user.repo';
import { OrderDocument, OrderSchema, OrderMongooseRepository } from '../repo/mongoose/order.repo';
import { USER_REPOSITORY } from '@module/user/user.token';
import { ORDER_REPOSITORY } from '@module/order/order.token';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddd_app', {}),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: OrderDocument.name, schema: OrderSchema },
    ]),
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
  exports: [USER_REPOSITORY, ORDER_REPOSITORY],
})
export class MongooseDatabaseModule {}
