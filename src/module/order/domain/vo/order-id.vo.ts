import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';

interface OrderIdProps {
  value: string;
}

export class OrderId extends IdVO {
  constructor(props: OrderIdProps) {
    super(props);
  }

  public static init(): OrderId {
    const baseId = super.init();
    return new OrderId({ value: baseId.value });
  }

  public static create(value: string): ResultSpecification<OrderId> {
    const result = super.create(value);
    if (result.isFailure) {
      return ResultSpecification.fail(result.error);
    }
    return ResultSpecification.ok(new OrderId({ value }));
  }

  public static fromValue(value: string): OrderId {
    return new OrderId({ value });
  }
}
