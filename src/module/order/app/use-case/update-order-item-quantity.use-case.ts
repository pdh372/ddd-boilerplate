import type { IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { IdVO } from '@shared/domain/vo';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export interface IUpdateOrderItemQuantityDto {
  orderId: string;
  itemId: string;
  quantity: number;
}

export class UpdateOrderItemQuantityUseCase implements UseCase<IUpdateOrderItemQuantityDto, OrderAggregate> {
  constructor(
    private readonly _orderRepository: IOrderRepository,
    private readonly _domainEventService: DomainEventService,
  ) {}

  async execute(input: IUpdateOrderItemQuantityDto): Promise<Result<OrderAggregate>> {
    // Validate order ID
    const orderIdResult = IdVO.validate(input.orderId);
    if (orderIdResult.isFailure) {
      return Result.fail<OrderAggregate>({
        errorKey: orderIdResult.errorKey,
        errorParam: orderIdResult.errorParam,
      });
    }

    // Find order
    const orderResult = await this._orderRepository.findById(orderIdResult.getValue);
    if (orderResult.isFailure) {
      return Result.fail<OrderAggregate>(orderResult.error);
    }

    const order = orderResult.getValue;
    if (!order) {
      return Result.fail<OrderAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
      });
    }

    // Update item quantity
    const updateResult = order.updateItemQuantity(input.itemId, input.quantity);
    if (updateResult.isFailure) {
      return Result.fail<OrderAggregate>({
        errorKey: updateResult.errorKey,
        errorParam: updateResult.errorParam,
      });
    }

    try {
      // Save updated order
      const savedResult = await this._orderRepository.save(order);

      if (savedResult.isFailure) {
        return Result.fail<OrderAggregate>(savedResult.error);
      }

      const savedOrder = savedResult.getValue;

      // Publish domain events (if any)
      // If this fails, the exception will be caught and handled
      await this._domainEventService.publishEvents(savedOrder.domainEvents);

      // Clear events after successful publishing
      savedOrder.clearEvents();

      return Result.ok<OrderAggregate>(savedOrder);
    } catch (error) {
      // If event publishing fails, return failure result
      // Repository implementations should handle transaction rollback
      return Result.fail<OrderAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__CREATION_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }
}
