import { Specification } from '@shared/domain/specification/base.specification';
import type { OrderAggregate } from '../aggregate';
import { OrderStatus } from '../aggregate/order.aggregate';

/**
 * Concrete specification: Order can be shipped
 */
export class OrderCanBeShippedSpecification extends Specification<OrderAggregate> {
  isSatisfiedBy(order: OrderAggregate): boolean {
    // Business rules for shipping:
    // 1. Order must be confirmed
    if (order.status !== OrderStatus.CONFIRMED) return false;

    // 2. Order must have items
    if (order.items.length === 0) return false;

    // 3. Order must meet minimum value
    const totalValue = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (totalValue < 10) return false;

    // 4. All items must have positive quantities
    if (order.items.some((item) => item.quantity <= 0)) return false;

    return true;
  }
}

/**
 * Concrete specification: Order can be cancelled
 */
export class OrderCanBeCancelledSpecification extends Specification<OrderAggregate> {
  isSatisfiedBy(order: OrderAggregate): boolean {
    // Can only cancel pending or confirmed orders
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);
  }
}

/**
 * Concrete specification: Order requires special handling
 */
export class OrderRequiresSpecialHandlingSpecification extends Specification<OrderAggregate> {
  isSatisfiedBy(order: OrderAggregate): boolean {
    // Orders with high value or many items need special handling
    const totalValue = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return totalValue > 1000 || totalItems > 20;
  }
}
