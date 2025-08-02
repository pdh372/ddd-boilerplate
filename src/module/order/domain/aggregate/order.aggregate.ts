import { AggregateRoot } from '@shared/domain/aggregate';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

import { OrderItemEntity, type IOrderItemProps } from '../entity';
import { OrderId } from '../vo';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

interface IOrderProps {
  id: OrderId;
  customerId: string;
  status: OrderStatus;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderAggregate extends AggregateRoot<OrderId> {
  private _props: IOrderProps;

  get props(): IOrderProps {
    return this._props;
  }

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
    items: Omit<IOrderItemProps, 'id'>[];
  }): ResultSpecification<OrderAggregate> {
    if (props.items.length === 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__EMPTY_ORDER,
      });
    }

    const now = new Date();
    const orderId = OrderId.generate();

    const orderItems = props.items.map((item) => OrderItemEntity.create(item));

    const orderProps: IOrderProps = {
      id: orderId.getValue,
      customerId: props.customerId,
      status: OrderStatus.PENDING,
      items: orderItems,
      createdAt: now,
      updatedAt: now,
    };

    const order = new OrderAggregate(orderProps);

    return ResultSpecification.ok<OrderAggregate>(order);
  }

  public static fromValue(state: IOrderProps): OrderAggregate {
    return new OrderAggregate(state);
  }

  public addItem(itemProps: Omit<IOrderItemProps, 'id'>): ResultSpecification<void> {
    const newItem = OrderItemEntity.create(itemProps);
    this._props.items.push(newItem);
    this._props.updatedAt = new Date();

    return ResultSpecification.ok();
  }

  public updateItemQuantity(itemId: string, quantity: number): ResultSpecification<void> {
    const item = this._props.items.find((item) => item.props.id === itemId);

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

    const itemIndex = this._props.items.findIndex((item) => item.props.id === itemId);

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

    this._props.status = OrderStatus.CONFIRMED;
    this._props.updatedAt = new Date();

    return ResultSpecification.ok();
  }
}
