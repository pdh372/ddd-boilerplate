import type { OrderAggregate } from '@module/order/domain';
import type { OrderResponseDto } from '../dto';

/**
 * Mapper utility for converting domain objects to presentation DTOs
 * Follows DDD principle of keeping domain objects separate from presentation concerns
 */
export class OrderMapper {
  /**
   * Converts OrderAggregate to OrderResponseDto
   * @param order - OrderAggregate from domain
   * @returns OrderResponseDto for presentation layer
   */
  public static toResponseDto(order: OrderAggregate): OrderResponseDto {
    return {
      id: order.id.value,
      customerId: order.customerId.value,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      items: order.items.map((item) => ({
        id: item.props.id.value,
        productId: item.props.productId.value, // Extract string from IdVO
        productName: item.props.productName.value,
        quantity: item.props.quantity,
        unitPrice: item.props.unitPrice,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
