import type { IdVO } from '@shared/domain/vo';
import type { OrderAggregate } from '../aggregate';
import type { Result } from '@shared/domain/specification';

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<Result<OrderAggregate>>;
  findById(id: IdVO): Promise<Result<OrderAggregate | null>>;
  findByCustomerId(customerId: IdVO): Promise<Result<OrderAggregate[]>>;
  delete(id: IdVO): Promise<Result<void>>;
}
