import { HttpStatus } from '@nestjs/common';
import { TRANSLATOR_KEY } from './translator.key';

export const ERROR_STATUS_CODE: Record<string, number> = {
  [TRANSLATOR_KEY.ERROR__USER__EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [TRANSLATOR_KEY.ERROR__USER__NOT_FOUND]: HttpStatus.NOT_FOUND,
  [TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL]: HttpStatus.BAD_REQUEST,
  [TRANSLATOR_KEY.ERROR__USER__INVALID_NAME]: HttpStatus.BAD_REQUEST,
  
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY]: HttpStatus.BAD_REQUEST,
  [TRANSLATOR_KEY.ERROR__ORDER__ITEM_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [TRANSLATOR_KEY.ERROR__ORDER__CANNOT_REMOVE_LAST_ITEM]: HttpStatus.BAD_REQUEST,
  [TRANSLATOR_KEY.ERROR__ORDER__EMPTY_ORDER]: HttpStatus.BAD_REQUEST,
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION]: HttpStatus.BAD_REQUEST,
  [TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND]: HttpStatus.NOT_FOUND,
  
  [TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID]: HttpStatus.BAD_REQUEST,
};

const validateStatusCodeMappings = (): void => {
  const allErrorKeys = Object.values(TRANSLATOR_KEY);
  const missingKeys = allErrorKeys.filter((key) => !ERROR_STATUS_CODE[key]);

  if (missingKeys.length > 0) {
    console.error('⚠️  Missing HTTP status codes for:', missingKeys);
  }
};

validateStatusCodeMappings();
