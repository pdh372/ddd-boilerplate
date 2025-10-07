export const LANGUAGE_TYPE = {
  EN: 'en',
  VI: 'vi',
} as const;

export const TRANSLATOR_KEY = {
  ERROR__USER__EMAIL_ALREADY_EXISTS: 'error.user.email_already_exists',
  ERROR__USER__NOT_FOUND: 'error.user.not_found',
  ERROR__USER__INVALID_EMAIL: 'error.user.invalid_email',
  ERROR__USER__INVALID_NAME: 'error.user.invalid_name',
  ERROR__USER__CREATION_FAILED: 'error.user.creation_failed',

  ERROR__ORDER__INVALID_QUANTITY: 'error.order.invalid_quantity',
  ERROR__ORDER__INVALID_UNIT_PRICE: 'error.order.invalid_unit_price',
  ERROR__ORDER__ITEM_NOT_FOUND: 'error.order.item_not_found',
  ERROR__ORDER__CANNOT_REMOVE_LAST_ITEM: 'error.order.cannot_remove_last_item',
  ERROR__ORDER__EMPTY_ORDER: 'error.order.empty_order',
  ERROR__ORDER__INVALID_STATUS_TRANSITION: 'error.order.invalid_status_transition',
  ERROR__ORDER__NOT_FOUND: 'error.order.not_found',
  ERROR__ORDER__INVALID_PRODUCT_NAME: 'error.order.invalid_product_name',
  ERROR__ORDER__CREATION_FAILED: 'error.order.creation_failed',
  ERROR__ORDER__ITEMS_CREATION_FAILED: 'error.order.items_creation_failed',
  ERROR__ORDER__EXPORT_FAILED: 'error.order.export_failed',

  ERROR__COMMON__INVALID_ID: 'error.common.invalid_id',

  // Event Store errors
  ERROR__EVENT_STORE__CONCURRENCY_ERROR: 'error.event_store.concurrency_error',
  ERROR__EVENT_STORE__APPEND_ERROR: 'error.event_store.append_error',
  ERROR__EVENT_STORE__GET_ERROR: 'error.event_store.get_error',
  ERROR__EVENT_STORE__SNAPSHOT_ERROR: 'error.event_store.snapshot_error',

  // Domain Service errors
  ERROR__USER__CHECK_FAILED: 'error.user.check_failed',
} as const;
