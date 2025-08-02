import { type IOrderRepository, OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import type { ICreateOrderDto } from '../dto';

export class CreateOrderUseCase implements UseCase<ICreateOrderDto, OrderAggregate> {
  constructor(private readonly _orderRepository: IOrderRepository) {}

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

    const orderSaved = await this._orderRepository.save(newOrderResult.getValue);

    return ResultSpecification.ok<OrderAggregate>(orderSaved);
  }
}