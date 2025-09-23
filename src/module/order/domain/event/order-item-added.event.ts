import type { EventRoot } from '@shared/domain/event';
import type { OrderAggregate } from '../aggregate/order.aggregate';
import type { OrderItemEntity } from '../entity/order-item.entity';

export class OrderItemAddedEvent implements EventRoot {
  public occurredOn: Date;
  public order: OrderAggregate;
  public addedItem: OrderItemEntity;

  constructor(order: OrderAggregate, addedItem: OrderItemEntity) {
    this.occurredOn = new Date();
    this.order = order;
    this.addedItem = addedItem;
  }

  getAggregateId(): string {
    return this.order.id.value;
  }
}
