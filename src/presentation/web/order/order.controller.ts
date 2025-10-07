import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  UpdateOrderItemQuantityUseCase,
  AddOrderItemUseCase,
  ExportCustomerOrdersUseCase,
} from '@module/order/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateOrderDto, AddOrderItemDto, OrderResponseDto, ExportOrdersResponseDto } from './dto';
import { ERROR_STATUS_CODE } from '@shared/translator';
import { OrderMapper } from './mapper';

@Controller('order')
export class OrderController {
  constructor(
    private readonly _createOrderUseCase: CreateOrderUseCase,
    private readonly _getOrderUseCase: GetOrderUseCase,
    private readonly _updateOrderItemQuantityUseCase: UpdateOrderItemQuantityUseCase,
    private readonly _addOrderItemUseCase: AddOrderItemUseCase,
    private readonly _exportCustomerOrdersUseCase: ExportCustomerOrdersUseCase,
  ) {}

  @Post()
  async createOrder(
    @Body() body: CreateOrderDto,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<OrderResponseDto> {
    const result = await this._createOrderUseCase.execute(body);

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    return OrderMapper.toResponseDto(result.getValue);
  }

  @Get(':id')
  async getOrder(
    @Param('id') id: string,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<OrderResponseDto> {
    const result = await this._getOrderUseCase.execute({ orderId: id });

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    return OrderMapper.toResponseDto(result.getValue);
  }

  @Put(':id/items/:itemId/quantity')
  async updateItemQuantity(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<OrderResponseDto> {
    const result = await this._updateOrderItemQuantityUseCase.execute({
      orderId,
      itemId,
      quantity: body.quantity,
    });

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    return OrderMapper.toResponseDto(result.getValue);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') orderId: string,
    @Body() body: AddOrderItemDto,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<OrderResponseDto> {
    const result = await this._addOrderItemUseCase.execute({
      orderId,
      productId: body.productId,
      productName: body.productName,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
    });

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    return OrderMapper.toResponseDto(result.getValue);
  }

  @Get('customer/:customerId/export')
  async exportCustomerOrders(
    @Param('customerId') customerId: string,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<ExportOrdersResponseDto> {
    const result = await this._exportCustomerOrdersUseCase.execute({ customerId });

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    return OrderMapper.toExportResponseDto(result.getValue, customerId);
  }
}
