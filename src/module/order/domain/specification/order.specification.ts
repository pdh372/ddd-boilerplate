import { Specification } from '@shared/domain/specification/base.specification';
import type { OrderAggregate } from '../aggregate';
import { OrderStatus } from '../aggregate/order.aggregate';

/**
 * Business rule: Order must be above minimum value
 */
export class MinimumOrderValueSpecification extends Specification<OrderAggregate> {
  private readonly minimumValue = 100;

  isSatisfiedBy(order: OrderAggregate): boolean {
    const totalValue = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return totalValue >= this.minimumValue;
  }
}

/**
 * Business rule: Order can be modified (not shipped or delivered)
 */
export class ModifiableOrderSpecification extends Specification<OrderAggregate> {
  private readonly nonModifiableStatuses = [OrderStatus.SHIPPED, OrderStatus.DELIVERED];

  isSatisfiedBy(order: OrderAggregate): boolean {
    return !this.nonModifiableStatuses.includes(order.status);
  }
}

/**
 * Business rule: Order has reasonable item count
 */
export class ReasonableItemCountSpecification extends Specification<OrderAggregate> {
  private readonly maxItems = 50;
  private readonly minItems = 1;

  isSatisfiedBy(order: OrderAggregate): boolean {
    const itemCount = order.items.length;
    return itemCount >= this.minItems && itemCount <= this.maxItems;
  }
}

/**
 * Composite specification: Order is valid for processing
 */
export class ProcessableOrderSpecification extends Specification<OrderAggregate> {
  private readonly minimumValueSpec = new MinimumOrderValueSpecification();
  private readonly modifiableSpec = new ModifiableOrderSpecification();
  private readonly reasonableItemsSpec = new ReasonableItemCountSpecification();

  isSatisfiedBy(order: OrderAggregate): boolean {
    return this.minimumValueSpec.and(this.modifiableSpec).and(this.reasonableItemsSpec).isSatisfiedBy(order);
  }
}
