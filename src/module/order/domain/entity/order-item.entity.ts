import { EntityRoot } from '@shared/domain/entity';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { OrderIdItem, ProductId, ProductName } from '../vo';

export interface IOrderItemProps {
  id: OrderIdItem;
  productId: ProductId;
  productName: ProductName;
  quantity: number;
  unitPrice: number;
}

export class OrderItemEntity extends EntityRoot<OrderIdItem> {
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

  public static create(props: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }): ResultSpecification<OrderItemEntity> {
    if (props.quantity <= 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY,
        errorParam: { min: 1 },
      });
    }

    if (props.unitPrice <= 0) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_UNIT_PRICE,
      });
    }

    const productIdResult = ProductId.validate(props.productId);
    if (productIdResult.isFailure) {
      return ResultSpecification.fail(productIdResult.error);
    }

    const productNameResult = ProductName.validate(props.productName);
    if (productNameResult.isFailure) {
      return ResultSpecification.fail(productNameResult.error);
    }

    const orderItem = new OrderItemEntity({
      id: OrderIdItem.init(),
      productId: productIdResult.getValue,
      productName: productNameResult.getValue,
      quantity: props.quantity,
      unitPrice: props.unitPrice,
    });

    return ResultSpecification.ok(orderItem);
  }
}
