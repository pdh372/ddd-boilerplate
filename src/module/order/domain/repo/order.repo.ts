import type { OrderAggregate } from '../aggregate';
import type { OrderId } from '../vo';

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<OrderAggregate>;
  findById(id: OrderId): Promise<OrderAggregate | null>;
  findByCustomerId(customerId: string): Promise<OrderAggregate[]>;
  delete(id: OrderId): Promise<void>;
}
