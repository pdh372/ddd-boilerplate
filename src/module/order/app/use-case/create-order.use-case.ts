import { type IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import type { ICreateOrderDto } from '../dto';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export class CreateOrderUseCase implements UseCase<ICreateOrderDto, OrderAggregate> {
  constructor(
    private readonly _orderRepository: IOrderRepository,
    private readonly _domainEventService: DomainEventService,
  ) {}

  async execute(input: ICreateOrderDto): Promise<ResultSpecification<OrderAggregate>> {
    const newOrderResult = OrderAggregate.create({
      customerId: input.customerId,
      items: input.items,
    });

    if (newOrderResult.isFailure) {
      return ResultSpecification.fail<OrderAggregate>({
        errorKey: newOrderResult.errorKey,
        errorParam: newOrderResult.errorParam,
      });
    }

    const order = newOrderResult.getValue;
    const orderSaved = await this._orderRepository.save(order);

    // Publish domain events (e.g., OrderCreatedEvent)
    await this._domainEventService.publishEvents(orderSaved.domainEvents);

    // Clear events after publishing
    orderSaved.clearEvents();

    return ResultSpecification.ok<OrderAggregate>(orderSaved);
  }
}