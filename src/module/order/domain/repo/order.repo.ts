import type { IdVO } from '@shared/domain/vo';
import type { OrderAggregate } from '../aggregate';

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<OrderAggregate>;
  findById(id: IdVO): Promise<OrderAggregate | null>;
  findByCustomerId(customerId: IdVO): Promise<OrderAggregate[]>;
  delete(id: IdVO): Promise<void>;
}
