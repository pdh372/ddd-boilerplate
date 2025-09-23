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
      id: order.props.id.value,
      customerId: order.props.customerId.value,
      status: order.props.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      items: order.props.items.map((item) => ({
        id: item.props.id.value,
        productId: item.props.productId,
        productName: item.props.productName.value,
        quantity: item.props.quantity,
        unitPrice: item.props.unitPrice,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.props.createdAt,
      updatedAt: order.props.updatedAt,
    };
  }
}
