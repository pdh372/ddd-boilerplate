import type { IdVO } from '@shared/domain/vo';
import type { OrderAggregate } from '../aggregate';
import type { ResultSpecification } from '@shared/domain/specification';

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<ResultSpecification<OrderAggregate>>;
  findById(id: IdVO): Promise<ResultSpecification<OrderAggregate | null>>;
  findByCustomerId(customerId: IdVO): Promise<ResultSpecification<OrderAggregate[]>>;
  delete(id: IdVO): Promise<ResultSpecification<void>>;
}
