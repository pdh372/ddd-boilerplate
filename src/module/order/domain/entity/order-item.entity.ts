import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { ProductName } from '../vo';
import { IdVO } from '@shared/domain/vo';

export interface IOrderItemProps {
  readonly id: IdVO;
  readonly productId: IdVO;
  readonly productName: ProductName;
  quantity: number;
  unitPrice: number;
}

export class OrderItemEntity {
  private readonly _props: IOrderItemProps;

  constructor(props: IOrderItemProps) {
    this._props = props;
  }

  get id(): IdVO {
    return this._props.id;
  }

  get productId(): IdVO {
    return this._props.productId;
  }

  get productName(): ProductName {
    return this._props.productName;
  }

  get quantity(): number {
    return this._props.quantity;
  }

  get unitPrice(): number {
    return this._props.unitPrice;
  }

  get totalPrice(): number {
    return this._props.quantity * this._props.unitPrice;
  }

  public updateQuantity(quantity: number): Result<void> {
    if (quantity <= 0) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY,
        errorParam: { min: 1 },
      });
    }
    this._props.quantity = quantity;
    return Result.ok();
  }

  public static create(props: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }): Result<OrderItemEntity> {
    if (props.quantity <= 0) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY,
        errorParam: { min: 1 },
      });
    }

    if (props.unitPrice <= 0) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_UNIT_PRICE,
      });
    }

    const productIdResult = IdVO.validate(props.productId);
    if (productIdResult.isFailure) {
      return Result.fail(productIdResult.error);
    }

    const productNameResult = ProductName.validate(props.productName);
    if (productNameResult.isFailure) {
      return Result.fail(productNameResult.error);
    }

    const orderItem = new OrderItemEntity({
      productId: productIdResult.getValue, // IdVO object, not .value
      productName: productNameResult.getValue,
      quantity: props.quantity,
      unitPrice: props.unitPrice,
      id: IdVO.createPlaceholder(),
    });

    return Result.ok(orderItem);
  }
}
