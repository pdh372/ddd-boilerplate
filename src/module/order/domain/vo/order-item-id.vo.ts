import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';

interface OrderIdItemProps {
  value: string;
}

export class OrderIdItem extends IdVO {
  constructor(props: OrderIdItemProps) {
    super(props);
  }

  public static init(): OrderIdItem {
    const baseId = super.init();
    return new OrderIdItem({ value: baseId.value });
  }

  public static validate(value: string): ResultSpecification<OrderIdItem> {
    const result = super.validate(value);
    if (result.isFailure) {
      return ResultSpecification.fail(result.error);
    }
    return ResultSpecification.ok(new OrderIdItem({ value }));
  }

  public static fromValue(value: string): OrderIdItem {
    return new OrderIdItem({ value });
  }
}
