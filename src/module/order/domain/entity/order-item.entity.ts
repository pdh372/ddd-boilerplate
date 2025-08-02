import { EntityRoot } from '@shared/domain/entity';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { OrderIdItem } from '../vo/order-item-id.vo';

export interface IOrderItemProps {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export class OrderItemEntity extends EntityRoot<string> {
  private _props: IOrderItemProps;

  constructor(props: IOrderItemProps) {
    super(props.id);
    this._props = props;
  }

  get props(): IOrderItemProps {
    return this._props;
  }

  get totalPrice(): number {
    return this._props.quantity * this._props.unitPrice;
  }

  public updateQuantity(quantity: number): ResultSpecification<void> {
    if (quantity <= 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY,
        errorParam: { min: 1 },
      });
    }
    this._props.quantity = quantity;
    return ResultSpecification.ok();
  }

  public static create(props: Omit<IOrderItemProps, 'id'>): OrderItemEntity {
    return new OrderItemEntity({
      ...props,
      id: OrderIdItem.generate().getValue.value,
    });
  }
}
