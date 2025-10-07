import { type IOrderRepository, type OrderAggregate } from '@module/order/domain';
import type { UseCase } from '@shared/app/use-case';
import { Result } from '@shared/domain/specification';
import { IdVO } from '@shared/domain/vo';
import { PAGINATION } from '@shared/config/constants.config';
import { TRANSLATOR_KEY } from '@shared/translator';

export interface IExportCustomerOrdersDto {
  customerId: string;
}

/**
 * Export all orders for a customer using batch fetching strategy
 * Prevents N+1 queries and OOM by fetching in configurable batch size
 */
export class ExportCustomerOrdersUseCase implements UseCase<IExportCustomerOrdersDto, OrderAggregate[]> {
  private readonly BATCH_SIZE = PAGINATION.EXPORT_BATCH_SIZE;

  constructor(private readonly _orderRepository: IOrderRepository) {}

  async execute(input: IExportCustomerOrdersDto): Promise<Result<OrderAggregate[]>> {
    // Validate customer ID
    const customerIdResult = IdVO.validate(input.customerId);
    if (customerIdResult.isFailure) {
      return Result.fail<OrderAggregate[]>({
        errorKey: customerIdResult.errorKey,
        errorParam: customerIdResult.errorParam,
      });
    }

    const customerId = customerIdResult.getValue;
    const allOrders: OrderAggregate[] = [];
    let currentPage = 1;

    try {
      // Batch fetch with pagination to prevent OOM
      while (true) {
        const result = await this._orderRepository.findByCustomerId(customerId, {
          page: currentPage,
          limit: this.BATCH_SIZE,
        });

        if (result.isFailure) {
          return Result.fail<OrderAggregate[]>(result.error);
        }

        const paginatedResult = result.getValue;
        allOrders.push(...paginatedResult.items);

        // Stop if no more pages
        if (!paginatedResult.hasNextPage) {
          break;
        }

        currentPage++;
      }

      return Result.ok(allOrders);
    } catch (error) {
      return Result.fail<OrderAggregate[]>({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__EXPORT_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }
}
