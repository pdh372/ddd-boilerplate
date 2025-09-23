import { LANGUAGE_TYPE, TRANSLATOR_KEY } from './translator.key';

export const TRANSLATOR_MESSAGE: Record<
  ConstValue<typeof TRANSLATOR_KEY>,
  Record<ConstValue<typeof LANGUAGE_TYPE>, string>
> = {
  // USER
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
    [LANGUAGE_TYPE.EN]: 'Name must be between {{min_length}} and {{max_length}} characters',
    [LANGUAGE_TYPE.VI]: 'Tên phải có từ {{min_length}} đến {{max_length}} ký tự',
  },
  [TRANSLATOR_KEY.ERROR__USER__CHECK_FAILED]: {
    [LANGUAGE_TYPE.EN]: 'Failed to validate user eligibility',
    [LANGUAGE_TYPE.VI]: 'Không thể kiểm tra tính hợp lệ của người dùng',
  },

  // ORDER
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY]: {
    [LANGUAGE_TYPE.EN]: 'Quantity must be greater than {{min}}',
    [LANGUAGE_TYPE.VI]: 'Số lượng phải lớn hơn {{min}}',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_UNIT_PRICE]: {
    [LANGUAGE_TYPE.EN]: 'Unit price must be greater than 0',
    [LANGUAGE_TYPE.VI]: 'Giá đơn vị phải lớn hơn 0',
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
  [TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND]: {
    [LANGUAGE_TYPE.EN]: 'Order not found',
    [LANGUAGE_TYPE.VI]: 'Không tìm thấy đơn hàng',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__INVALID_PRODUCT_NAME]: {
    [LANGUAGE_TYPE.EN]: 'Product name must be between 1 and 255 characters',
    [LANGUAGE_TYPE.VI]: 'Tên sản phẩm phải từ 1 đến 255 ký tự',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__CREATION_FAILED]: {
    [LANGUAGE_TYPE.EN]: 'Failed to create order',
    [LANGUAGE_TYPE.VI]: 'Không thể tạo đơn hàng',
  },
  [TRANSLATOR_KEY.ERROR__ORDER__ITEMS_CREATION_FAILED]: {
    [LANGUAGE_TYPE.EN]: 'Failed to create order items',
    [LANGUAGE_TYPE.VI]: 'Không thể tạo sản phẩm trong đơn hàng',
  },

  // COMMON
  [TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID]: {
    [LANGUAGE_TYPE.EN]: 'Invalid user ID',
    [LANGUAGE_TYPE.VI]: 'ID người dùng không hợp lệ',
  },

  // EVENT STORE
  [TRANSLATOR_KEY.ERROR__EVENT_STORE__CONCURRENCY_ERROR]: {
    [LANGUAGE_TYPE.EN]: 'Concurrency conflict detected',
    [LANGUAGE_TYPE.VI]: 'Phát hiện xung đột phiên bản',
  },
  [TRANSLATOR_KEY.ERROR__EVENT_STORE__APPEND_ERROR]: {
    [LANGUAGE_TYPE.EN]: 'Failed to append events',
    [LANGUAGE_TYPE.VI]: 'Không thể lưu sự kiện',
  },
  [TRANSLATOR_KEY.ERROR__EVENT_STORE__GET_ERROR]: {
    [LANGUAGE_TYPE.EN]: 'Failed to retrieve events',
    [LANGUAGE_TYPE.VI]: 'Không thể lấy sự kiện',
  },
  [TRANSLATOR_KEY.ERROR__EVENT_STORE__SNAPSHOT_ERROR]: {
    [LANGUAGE_TYPE.EN]: 'Failed to manage snapshot',
    [LANGUAGE_TYPE.VI]: 'Không thể quản lý bản chụp',
  },
} as const;
