import { Logger } from '@nestjs/common';

/**
 * Retry configuration options for exponential backoff
 */
export interface IRetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number;

  /**
   * Base delay in milliseconds for exponential backoff (default: 100ms)
   */
  baseDelay?: number;

  /**
   * Maximum delay between retries in milliseconds (default: 3000ms)
   */
  maxDelay?: number;

  /**
   * Function to determine if error should trigger retry
   * Return true for transient errors (network, timeout, deadlock)
   * Return false for permanent errors (validation, constraint violations)
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Optional logger for retry attempts
   */
  logger?: Logger;

  /**
   * Operation name for logging purposes
   */
  operationName?: string;
}

/**
 * Default retry predicate - retries all errors
 */
const defaultShouldRetry = (): boolean => true;

/**
 * Executes an async operation with exponential backoff retry logic
 *
 * Features:
 * - Exponential backoff algorithm (delay doubles each retry)
 * - Configurable max retries, base delay, and max delay
 * - Error classification (transient vs permanent)
 * - Comprehensive logging for debugging
 * - Jitter to prevent thundering herd problem
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await database.save(entity),
 *   {
 *     maxRetries: 3,
 *     baseDelay: 100,
 *     shouldRetry: (error) => isTransientError(error),
 *     logger: this.logger,
 *     operationName: 'saveUser'
 *   }
 * );
 * ```
 *
 * Retry delays with baseDelay=100ms:
 * - Attempt 1: immediate
 * - Attempt 2: ~100ms (100 * 2^0 + jitter)
 * - Attempt 3: ~200ms (100 * 2^1 + jitter)
 * - Attempt 4: ~400ms (100 * 2^2 + jitter)
 *
 * @param operation - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to operation result
 * @throws Last error if all retries exhausted
 */
export async function retryWithBackoff<T>(operation: () => Promise<T>, options: IRetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 3000,
    shouldRetry = defaultShouldRetry,
    logger,
    operationName = 'operation',
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0 && logger) {
        logger.debug(`Retry attempt ${attempt}/${maxRetries} for ${operationName}`);
      }

      const result = await operation();

      if (attempt > 0 && logger) {
        logger.log(`${operationName} succeeded after ${attempt} retries`);
      }

      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // Check if we should retry this error
      const isRetryable = shouldRetry(error);

      if (!isRetryable) {
        if (logger) {
          logger.warn(`${operationName} failed with non-retryable error: ${extractErrorMessage(error)}`);
        }
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt > maxRetries) {
        if (logger) {
          logger.error(`${operationName} failed after ${maxRetries} retries: ${extractErrorMessage(error)}`);
        }
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * baseDelay * 0.1; // 10% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      if (logger) {
        logger.warn(
          `${operationName} failed (attempt ${attempt}/${maxRetries}), ` +
            `retrying in ${Math.round(delay)}ms: ${extractErrorMessage(error)}`,
        );
      }

      // Wait before next retry
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Sleep utility for async delay
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract error message from unknown error type
 * @param error - Error object
 * @returns Error message string
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Circuit Breaker pattern to prevent retry storms when service is down
 *
 * States:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Service is down, fail fast without retrying
 * - HALF_OPEN: Testing if service recovered
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,    // Open after 5 failures
 *   successThreshold: 2,    // Close after 2 successes
 *   timeout: 60000          // Stay open for 60 seconds
 * });
 *
 * await breaker.execute(async () => {
 *   return await database.query('SELECT * FROM users');
 * });
 * ```
 */
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly options: {
      /**
       * Number of consecutive failures before opening circuit (default: 5)
       */
      failureThreshold?: number;
      /**
       * Number of consecutive successes to close circuit (default: 2)
       */
      successThreshold?: number;
      /**
       * Time in ms to wait before attempting HALF_OPEN (default: 60000ms = 1 minute)
       */
      timeout?: number;
      /**
       * Optional name for logging
       */
      name?: string;
    } = {},
  ) {
    this.options.failureThreshold = options.failureThreshold ?? 5;
    this.options.successThreshold = options.successThreshold ?? 2;
    this.options.timeout = options.timeout ?? 60000;
    this.options.name = options.name ?? 'CircuitBreaker';
  }

  /**
   * Execute operation with circuit breaker protection
   * @param operation - Async function to execute
   * @returns Promise resolving to operation result
   * @throws CircuitBreakerOpenError if circuit is open
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const waitTime = Math.round((this.nextAttempt - Date.now()) / 1000);
        this.logger.warn(
          `[${this.options.name}] Circuit is OPEN, failing fast. ` +
            `Retry in ${waitTime}s (${this.failureCount} failures)`,
        );
        throw new CircuitBreakerOpenError(`Circuit breaker is OPEN for ${this.options.name}. Service may be down.`);
      }

      // Transition to HALF_OPEN to test if service recovered
      this.state = 'HALF_OPEN';
      this.logger.log(`[${this.options.name}] Circuit entering HALF_OPEN state, testing recovery`);
    }

    try {
      const result = await operation();

      // Operation succeeded
      this.onSuccess();
      return result;
    } catch (error) {
      // Operation failed
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold!) {
        // Close circuit - service recovered
        this.state = 'CLOSED';
        this.successCount = 0;
        this.logger.log(
          `[${this.options.name}] Circuit CLOSED - service recovered ` +
            `(${this.options.successThreshold} consecutive successes)`,
        );
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.successCount = 0;
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold!) {
      // Open circuit - service is down
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.timeout!;

      this.logger.error(
        `[${this.options.name}] Circuit OPENED - service appears down ` +
          `(${this.failureCount} failures). Will retry in ${this.options.timeout! / 1000}s`,
      );
    }
  }

  /**
   * Get current circuit state for monitoring
   */
  getState(): { state: string; failureCount: number; successCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }

  /**
   * Manually reset circuit to CLOSED state (for testing/admin)
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.logger.log(`[${this.options.name}] Circuit manually reset to CLOSED`);
  }
}

/**
 * Custom error thrown when circuit breaker is open
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}
