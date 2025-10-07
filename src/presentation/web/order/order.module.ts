import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { USE_CASE } from '@infra/use-case';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [
    USE_CASE.ORDER.CREATE_ORDER,
    USE_CASE.ORDER.GET_ORDER,
    USE_CASE.ORDER.UPDATE_ORDER_ITEM_QUANTITY,
    USE_CASE.ORDER.ADD_ORDER_ITEM,
    USE_CASE.ORDER.EXPORT_CUSTOMER_ORDERS,
  ],
})
export class OrderModule {}
