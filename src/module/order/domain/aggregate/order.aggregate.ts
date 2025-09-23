import { AggregateRoot } from '@shared/domain/aggregate';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

import { OrderItemEntity } from '../entity';
import { OrderStatusChangedEvent, OrderItemAddedEvent } from '../event';
import { IdVO } from '@shared/domain/vo';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

interface IOrderProps {
  readonly id: IdVO;
  readonly customerId: IdVO;
  status: OrderStatus;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderAggregate extends AggregateRoot<IdVO> {
  private readonly _props: IOrderProps;

  // Individual getters following DDD principles
  get id(): IdVO {
    return this._props.id;
  }

  get customerId(): IdVO {
    return this._props.customerId;
  }

  get status(): OrderStatus {
    return this._props.status;
  }

  get items(): OrderItemEntity[] {
    return [...this._props.items]; // Defensive copy
  }

  get createdAt(): Date {
    return new Date(this._props.createdAt); // Defensive copy
  }

  get updatedAt(): Date {
    return new Date(this._props.updatedAt); // Defensive copy
  }

  // Computed properties
  get totalAmount(): number {
    return this._props.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  get itemCount(): number {
    return this._props.items.length;
  }

  private constructor(props: IOrderProps) {
    super(props.id);
    this._props = props;
  }

  public static create(props: {
    customerId: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[];
  }): ResultSpecification<OrderAggregate> {
    if (props.items.length === 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__EMPTY_ORDER,
      });
    }

    const now = new Date();

    const orderItemResults = props.items.map((item) => OrderItemEntity.create(item));

    const failedItem = orderItemResults.find((result) => result.isFailure);
    if (failedItem) {
      return ResultSpecification.fail(failedItem.error);
    }

    const orderItems = orderItemResults.map((result) => result.getValue);

    const customerIdResult = IdVO.validate(props.customerId);
    if (customerIdResult.isFailure) {
      return ResultSpecification.fail(customerIdResult.error);
    }

    const orderProps: IOrderProps = {
      customerId: customerIdResult.getValue,
      status: OrderStatus.PENDING,
      items: orderItems,
      createdAt: now,
      updatedAt: now,
      id: IdVO.createPlaceholder(), // Let MongoDB generate ID
    };

    const order = new OrderAggregate(orderProps);

    return ResultSpecification.ok<OrderAggregate>(order);
  }

  public static fromValue(state: IOrderProps): OrderAggregate {
    return new OrderAggregate(state);
  }

  public addItem(itemProps: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }): ResultSpecification<void> {
    const itemResult = OrderItemEntity.create(itemProps);
    if (itemResult.isFailure) {
      return ResultSpecification.fail(itemResult.error);
    }

    const newItem = itemResult.getValue;
    this._props.items.push(newItem);
    this._props.updatedAt = new Date();

    this.addDomainEvent(new OrderItemAddedEvent(this, newItem));

    return ResultSpecification.ok();
  }

  public updateItemQuantity(itemId: string, quantity: number): ResultSpecification<void> {
    const item = this._props.items.find((item) => item.id.value === itemId);

    if (!item) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__ITEM_NOT_FOUND,
      });
    }

    const updateResult = item.updateQuantity(quantity);
    if (updateResult.isFailure) {
      return updateResult;
    }

    this._props.updatedAt = new Date();
    return ResultSpecification.ok();
  }

  public removeItem(itemId: string): ResultSpecification<void> {
    if (this._props.items.length === 1) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__CANNOT_REMOVE_LAST_ITEM,
      });
    }

    const itemIndex = this._props.items.findIndex((item) => item.id.value === itemId);

    if (itemIndex === -1) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__ITEM_NOT_FOUND,
      });
    }

    this._props.items.splice(itemIndex, 1);
    this._props.updatedAt = new Date();

    return ResultSpecification.ok();
  }

  public confirmOrder(): ResultSpecification<void> {
    if (this._props.status !== OrderStatus.PENDING) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION,
      });
    }

    if (this._props.items.length === 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__EMPTY_ORDER,
      });
    }

    const previousStatus = this._props.status;
    this._props.status = OrderStatus.CONFIRMED;
    this._props.updatedAt = new Date();

    this.addDomainEvent(new OrderStatusChangedEvent(this, previousStatus, OrderStatus.CONFIRMED));

    return ResultSpecification.ok();
  }

  public shipOrder(): ResultSpecification<void> {
    if (this._props.status !== OrderStatus.CONFIRMED) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION,
      });
    }

    const previousStatus = this._props.status;
    this._props.status = OrderStatus.SHIPPED;
    this._props.updatedAt = new Date();

    this.addDomainEvent(new OrderStatusChangedEvent(this, previousStatus, OrderStatus.SHIPPED));

    return ResultSpecification.ok();
  }

  public deliverOrder(): ResultSpecification<void> {
    if (this._props.status !== OrderStatus.SHIPPED) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION,
      });
    }

    const previousStatus = this._props.status;
    this._props.status = OrderStatus.DELIVERED;
    this._props.updatedAt = new Date();

    this.addDomainEvent(new OrderStatusChangedEvent(this, previousStatus, OrderStatus.DELIVERED));

    return ResultSpecification.ok();
  }

  public cancelOrder(): ResultSpecification<void> {
    if (this._props.status === OrderStatus.DELIVERED) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_STATUS_TRANSITION,
      });
    }

    const previousStatus = this._props.status;
    this._props.status = OrderStatus.CANCELLED;
    this._props.updatedAt = new Date();

    this.addDomainEvent(new OrderStatusChangedEvent(this, previousStatus, OrderStatus.CANCELLED));

    return ResultSpecification.ok();
  }
}
