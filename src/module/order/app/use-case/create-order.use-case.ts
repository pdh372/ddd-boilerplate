import { type IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { Result } from '@shared/domain/specification';
import type { ICreateOrderDto } from '../dto';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export class CreateOrderUseCase implements UseCase<ICreateOrderDto, OrderAggregate> {
  constructor(
    private readonly _orderRepository: IOrderRepository,
    private readonly _domainEventService: DomainEventService,
  ) {}

  async execute(input: ICreateOrderDto): Promise<Result<OrderAggregate>> {
    const newOrderResult = OrderAggregate.create({
      customerId: input.customerId,
      items: input.items,
    });

    if (newOrderResult.isFailure) {
      return Result.fail<OrderAggregate>({
        errorKey: newOrderResult.errorKey,
        errorParam: newOrderResult.errorParam,
      });
    }

    const order = newOrderResult.getValue;

    try {
      // Save aggregate to DB
      const savedResult = await this._orderRepository.save(order);

      if (savedResult.isFailure) {
        return Result.fail<OrderAggregate>(savedResult.error);
      }

      const orderSaved = savedResult.getValue;

      // Publish domain events (e.g., OrderCreatedEvent)
      // If this fails, the exception will be caught and handled
      await this._domainEventService.publishEvents(orderSaved.domainEvents);

      // Clear events after successful publishing
      orderSaved.clearEvents();

      return Result.ok<OrderAggregate>(orderSaved);
    } catch (error) {
      // If event publishing fails, return failure result
      // Repository implementations should handle transaction rollback
      return Result.fail<OrderAggregate>({
        errorKey: 'ERROR__ORDER__CREATION_FAILED',
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }
}