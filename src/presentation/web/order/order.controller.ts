import { Controller, Post, Get, Body, Param, HttpException } from '@nestjs/common';
import { CreateOrderUseCase, GetOrderUseCase } from '@module/order/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateOrderDto } from './dto';
import { ERROR_STATUS_CODE } from '@shared/translator';

@Controller('order')
export class OrderController {
  constructor(
    private readonly _createOrderUseCase: CreateOrderUseCase,
    private readonly _getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post()
  async createOrder(@Body() body: CreateOrderDto, @AcceptLanguage() acceptLanguage: IAcceptLanguageContext) {
    const result = await this._createOrderUseCase.execute(body);

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const order = result.getValue;

    return {
      id: order.props.id.value,
      customerId: order.props.customerId,
      status: order.props.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      items: order.props.items.map((item) => ({
        id: item.props.id,
        productId: item.props.productId,
        productName: item.props.productName,
        quantity: item.props.quantity,
        unitPrice: item.props.unitPrice,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.props.createdAt,
      updatedAt: order.props.updatedAt,
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @AcceptLanguage() acceptLanguage: IAcceptLanguageContext) {
    const result = await this._getOrderUseCase.execute({ orderId: id });

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const order = result.getValue;

    return {
      id: order.props.id.value,
      customerId: order.props.customerId,
      status: order.props.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      items: order.props.items.map((item) => ({
        id: item.props.id,
        productId: item.props.productId,
        productName: item.props.productName,
        quantity: item.props.quantity,
        unitPrice: item.props.unitPrice,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.props.createdAt,
      updatedAt: order.props.updatedAt,
    };
  }
}
