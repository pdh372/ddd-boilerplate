import type { IdVO } from '@shared/domain/vo';
import type { OrderAggregate } from '../aggregate';
import type { Result } from '@shared/domain/specification';

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IOrderRepository {
  save(order: OrderAggregate): Promise<Result<OrderAggregate>>;
  findById(id: IdVO): Promise<Result<OrderAggregate | null>>;

  /**
   * Find orders by customer ID with REQUIRED pagination
   * @param customerId - Customer ID
   * @param options - Pagination options (REQUIRED to prevent accidental full scans)
   * @returns Paginated result with metadata
   */
  findByCustomerId(customerId: IdVO, options: IPaginationOptions): Promise<Result<IPaginatedResult<OrderAggregate>>>;

  delete(id: IdVO): Promise<Result<void>>;
}
