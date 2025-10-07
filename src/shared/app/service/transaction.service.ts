import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@shared/domain/specification';

/**
 * Application Service for Transaction Management
 * Handles cross-cutting transaction concerns
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  /**
   * Executes an operation within a transaction boundary
   * @param operation The operation to execute
   * @param operationName Name for logging purposes
   */
  async executeInTransaction<T>(
    operation: () => Promise<Result<T>>,
    operationName: string,
  ): Promise<Result<T>> {
    this.logger.debug(`Starting transaction for: ${operationName}`);

    try {
      const result = await operation();

      if (result.isSuccess) {
        this.logger.debug(`Transaction committed successfully for: ${operationName}`);
      } else {
        this.logger.warn(`Transaction failed for ${operationName}: ${result.errorKey}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Transaction error for ${operationName}:`, error);
      return Result.fail({
        errorKey: 'TRANSACTION_ERROR',
        errorParam: { operation: operationName, error: String(error) },
      });
    }
  }

  /**
   * Executes multiple operations in a single transaction
   * @param operations Array of operations to execute
   * @param transactionName Name for logging purposes
   */
  async executeMultipleInTransaction<T>(
    operations: Array<() => Promise<Result<T>>>,
    transactionName: string,
  ): Promise<Result<T[]>> {
    this.logger.debug(`Starting batch transaction: ${transactionName}`);

    const results: T[] = [];

    try {
      for (const [index, operation] of operations.entries()) {
        const result = await operation();

        if (result.isFailure) {
          this.logger.warn(`Batch transaction failed at step ${index + 1} for ${transactionName}: ${result.errorKey}`);
          return Result.fail(result.error);
        }

        results.push(result.getValue);
      }

      this.logger.debug(`Batch transaction completed successfully: ${transactionName}`);
      return Result.ok(results);
    } catch (error) {
      this.logger.error(`Batch transaction error for ${transactionName}:`, error);
      return Result.fail({
        errorKey: 'BATCH_TRANSACTION_ERROR',
        errorParam: { transaction: transactionName, error: String(error) },
      });
    }
  }
}
