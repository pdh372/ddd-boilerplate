import type { EventRoot } from '@shared/domain/event';
import type { OrderAggregate, OrderStatus } from '../aggregate/order.aggregate';

export class OrderStatusChangedEvent implements EventRoot {
  public occurredOn: Date;
  public order: OrderAggregate;
  public previousStatus: OrderStatus;
  public newStatus: OrderStatus;

  constructor(order: OrderAggregate, previousStatus: OrderStatus, newStatus: OrderStatus) {
    this.occurredOn = new Date();
    this.order = order;
    this.previousStatus = previousStatus;
    this.newStatus = newStatus;
  }

  getAggregateId(): string {
    return this.order.id.value;
  }
}
