/**
 * Application-wide constants
 * Centralized configuration for magic numbers and defaults
 */

/**
 * Pagination Constants
 */
export const PAGINATION = {
  /** Default page size for API responses */
  DEFAULT_LIMIT: 10,
  /** Maximum page size allowed */
  MAX_LIMIT: 100,
  /** Batch size for export operations (prevents OOM) */
  EXPORT_BATCH_SIZE: 100,
} as const;

/**
 * Cache TTL Constants (in seconds)
 */
export const CACHE_TTL = {
  /** Default cache TTL - 1 hour */
  DEFAULT: 3600,
  /** User cache TTL - 30 minutes */
  USER: 1800,
  /** Order cache TTL - 15 minutes */
  ORDER: 900,
  /** Short-lived cache - 5 minutes */
  SHORT: 300,
  /** Long-lived cache - 24 hours */
  LONG: 86400,
} as const;

/**
 * Redis Connection Constants
 */
export const REDIS = {
  /** Maximum retry attempts per request */
  MAX_RETRIES_PER_REQUEST: 3,
  /** Base delay for exponential backoff (ms) */
  RETRY_BASE_DELAY: 50,
  /** Maximum retry delay (ms) */
  RETRY_MAX_DELAY: 3000,
  /** Connection timeout (ms) */
  CONNECTION_TIMEOUT: 10000,
  /** Keep-alive interval (ms) */
  KEEP_ALIVE_INTERVAL: 30000,
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  /** Minimum user name length */
  USER_NAME_MIN_LENGTH: 2,
  /** Maximum user name length */
  USER_NAME_MAX_LENGTH: 100,
  /** Minimum order quantity */
  ORDER_MIN_QUANTITY: 1,
  /** Maximum order quantity */
  ORDER_MAX_QUANTITY: 10000,
  /** Minimum order item price */
  ORDER_MIN_PRICE: 0,
} as const;

/**
 * Database Constants
 */
export const DATABASE = {
  /** Default connection pool size */
  POOL_SIZE: 10,
  /** Query timeout (ms) */
  QUERY_TIMEOUT: 30000,
} as const;
