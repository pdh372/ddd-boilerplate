export const ERROR_KEYS = {
  // User errors
  USER_INVALID_EMAIL: 'user.invalid_email',
  USER_INVALID_NAME: 'user.invalid_name',
  USER_EMAIL_ALREADY_EXISTS: 'user.email_already_exists',

  // Common errors
  VALIDATION_FAILED: 'common.validation_failed',
  NOT_FOUND: 'common.not_found',
  UNAUTHORIZED: 'common.unauthorized',
  FORBIDDEN: 'common.forbidden',
  INTERNAL_SERVER_ERROR: 'common.internal_server_error',
} as const;

export type IErrorKey = ConstValue<typeof ERROR_KEYS>;
