import { LANGUAGE_TYPE, TRANSLATOR_KEY } from './translator.key';

export const TRANSLATOR_MESSAGE: Record<
  ConstValue<typeof TRANSLATOR_KEY>,
  Record<ConstValue<typeof LANGUAGE_TYPE>, string>
> = {
  [TRANSLATOR_KEY.ERROR__USER__EMAIL_ALREADY_EXISTS]: {
    [LANGUAGE_TYPE.EN]: 'Email already exists',
    [LANGUAGE_TYPE.VI]: 'Email đã tồn tại',
  },
  [TRANSLATOR_KEY.ERROR__USER__NOT_FOUND]: {
    [LANGUAGE_TYPE.EN]: 'User not found',
    [LANGUAGE_TYPE.VI]: 'Không tìm thấy người dùng',
  },
  [TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL]: {
    [LANGUAGE_TYPE.EN]: 'Invalid email format',
    [LANGUAGE_TYPE.VI]: 'Định dạng email không hợp lệ',
  },
  [TRANSLATOR_KEY.ERROR__USER__INVALID_NAME]: {
    [LANGUAGE_TYPE.EN]: 'Name must be at least {{min_length}} character',
    [LANGUAGE_TYPE.VI]: 'Tên phải có ít nhất {{min_length}} ký tự',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY]: {
    [LANGUAGE_TYPE.EN]: 'Quantity must be greater than {{min}}',
    [LANGUAGE_TYPE.VI]: 'Số lượng phải lớn hơn {{min}}',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__ITEM_NOT_FOUND]: {
    [LANGUAGE_TYPE.EN]: 'Order item not found',
    [LANGUAGE_TYPE.VI]: 'Không tìm thấy sản phẩm trong đơn hàng',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__CANNOT_REMOVE_LAST_ITEM]: {
    [LANGUAGE_TYPE.EN]: 'Cannot remove the last item from order',
    [LANGUAGE_TYPE.VI]: 'Không thể xóa sản phẩm cuối cùng khỏi đơn hàng',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__EMPTY_ORDER]: {
    [LANGUAGE_TYPE.EN]: 'Order must have at least one item',
    [LANGUAGE_TYPE.VI]: 'Đơn hàng phải có ít nhất một sản phẩm',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION]: {
    [LANGUAGE_TYPE.EN]: 'Invalid order status transition',
    [LANGUAGE_TYPE.VI]: 'Không thể chuyển trạng thái đơn hàng',
  },
  [TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID]: {
    [LANGUAGE_TYPE.EN]: 'Invalid user ID',
    [LANGUAGE_TYPE.VI]: 'ID người dùng không hợp lệ',
  },
} as const;
