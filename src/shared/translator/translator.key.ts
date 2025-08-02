export const LANGUAGE_TYPE = {
  EN: 'en',
  VI: 'vi',
} as const;

export const TRANSLATOR_KEY = {
  ERROR__USER__EMAIL_ALREADY_EXISTS: 'error.user.email_already_exists',
  ERROR__USER__NOT_FOUND: 'error.user.not_found',
  ERROR__USER__INVALID_EMAIL: 'error.user.invalid_email',
  ERROR__USER__INVALID_NAME: 'error.user.invalid_name',

  ERROR__ORDER__INVALID_QUANTITY: 'error.order.invalid_quantity',
  ERROR__ORDER__ITEM_NOT_FOUND: 'error.order.item_not_found',
  ERROR__ORDER__CANNOT_REMOVE_LAST_ITEM: 'error.order.cannot_remove_last_item',
  ERROR__ORDER__EMPTY_ORDER: 'error.order.empty_order',
  ERROR__ORDER__INVALID_STATUS_TRANSITION: 'error.order.invalid_status_transition',
  ERROR__ORDER__NOT_FOUND: 'error.order.not_found',

  ERROR__COMMON__INVALID_ID: 'error.common.invalid_id',
} as const;
