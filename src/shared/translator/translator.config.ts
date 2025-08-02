export const LANGUAGE_TYPE = {
  EN: 'en',
  VI: 'vi',
} as const;

export const TRANSLATOR_KEY = {
  ERROR__USER__EMAIL_ALREADY_EXISTS: 'error.user.email_already_exists',
  ERROR__USER__NOT_FOUND: 'error.user.not_found',
  ERROR__USER__INVALID_EMAIL: 'error.user.invalid_email',
  ERROR__USER__INVALID_NAME: 'error.user.invalid_name',
} as const;

export const TRANSLATOR_CONFIG: Record<
  ConstValue<typeof TRANSLATOR_KEY>, 
  Record<ConstValue<typeof LANGUAGE_TYPE>, string>
> = {
  [TRANSLATOR_KEY.ERROR__USER__EMAIL_ALREADY_EXISTS]: {
    [LANGUAGE_TYPE.EN]: 'Email already exists',
    [LANGUAGE_TYPE.VI]: 'Email đã tồn tại',
  },
  [TRANSLATOR_KEY.ERROR__USER__NOT_FOUND]: {
    [LANGUAGE_TYPE.EN]: 'User not found {{name}}',
    [LANGUAGE_TYPE.VI]: 'Không tìm thấy người dùng {{name}}',
  },
  [TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL]: {
    [LANGUAGE_TYPE.EN]: 'Invalid email format',
    [LANGUAGE_TYPE.VI]: 'Định dạng email không hợp lệ',
  },
  [TRANSLATOR_KEY.ERROR__USER__INVALID_NAME]: {
    [LANGUAGE_TYPE.EN]: 'Name must be at least {{min_length}} characters',
    [LANGUAGE_TYPE.VI]: 'Tên phải có ít nhất {{min_length}} ký tự',
  },
} as const;
