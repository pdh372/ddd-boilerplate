import type { IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { IdVO } from '@shared/domain/vo';

export interface IUpdateOrderItemQuantityDto {
  orderId: string;
  itemId: string;
  quantity: number;
}

export class UpdateOrderItemQuantityUseCase implements UseCase<IUpdateOrderItemQuantityDto, OrderAggregate> {
  constructor(private readonly _orderRepository: IOrderRepository) {}

  async execute(input: IUpdateOrderItemQuantityDto): Promise<ResultSpecification<OrderAggregate>> {
    // Validate order ID
    const orderIdResult = IdVO.validate(input.orderId);
    if (orderIdResult.isFailure) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: orderIdResult.errorKey,
        errorParam: orderIdResult.errorParam,
      });
    }

    // Find order
    const order = await this._orderRepository.findById(orderIdResult.getValue);
    if (!order) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
      });
    }

    // Update item quantity
    const updateResult = order.updateItemQuantity(input.itemId, input.quantity);
    if (updateResult.isFailure) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: updateResult.errorKey,
        errorParam: updateResult.errorParam,
      });
    }

    // Save updated order
    const savedOrder = await this._orderRepository.save(order);
    return ResultSpecification.ok<OrderAggregate>(savedOrder);
  }
}
