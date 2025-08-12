import { type OrderAggregate, type IOrderRepository, OrderId } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

export interface IGetOrderDto {
  orderId: string;
}

export class GetOrderUseCase implements UseCase<IGetOrderDto, OrderAggregate> {
  constructor(private readonly _orderRepository: IOrderRepository) {}

  async execute(input: IGetOrderDto): Promise<ResultSpecification<OrderAggregate>> {
    const orderIdResult = OrderId.validate(input.orderId);
    if (orderIdResult.isFailure) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: orderIdResult.errorKey,
        errorParam: orderIdResult.errorParam,
      });
    }

    const order = await this._orderRepository.findById(orderIdResult.getValue);

    if (!order) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
      });
    }

    return ResultSpecification.ok<OrderAggregate>(order);
  }
}
