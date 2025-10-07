import type { IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { IdVO } from '@shared/domain/vo';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export interface IAddOrderItemDto {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export class AddOrderItemUseCase implements UseCase<IAddOrderItemDto, OrderAggregate> {
  constructor(
    private readonly _orderRepository: IOrderRepository,
    private readonly _domainEventService: DomainEventService,
  ) {}

  async execute(input: IAddOrderItemDto): Promise<ResultSpecification<OrderAggregate>> {
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

    // Add item
    const addResult = order.addItem({
      productId: input.productId,
      productName: input.productName,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    });

    if (addResult.isFailure) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: addResult.errorKey,
        errorParam: addResult.errorParam,
      });
    }

    // Save updated order
    const savedOrder = await this._orderRepository.save(order);

    // Publish domain events (e.g., OrderItemAddedEvent)
    await this._domainEventService.publishEvents(savedOrder.domainEvents);

    // Clear events after publishing
    savedOrder.clearEvents();

    return ResultSpecification.ok<OrderAggregate>(savedOrder);
  }
}
