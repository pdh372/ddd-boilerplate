import type { OrderAggregate } from '../aggregate';
import type { OrderId, CustomerId } from '../vo';

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<OrderAggregate>;
  findById(id: OrderId): Promise<OrderAggregate | null>;
  findByCustomerId(customerId: CustomerId): Promise<OrderAggregate[]>;
  delete(id: OrderId): Promise<void>;
}
