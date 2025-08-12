import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';

interface CustomerIdProps {
  value: string;
}

export class CustomerId extends IdVO {
  constructor(props: CustomerIdProps) {
    super(props);
  }

  public static init(): CustomerId {
    const baseId = super.init();
    return new CustomerId({ value: baseId.value });
  }

  public static validate(value: string): ResultSpecification<CustomerId> {
    const result = super.validate(value);
    if (result.isFailure) {
      return ResultSpecification.fail(result.error);
    }
    return ResultSpecification.ok(new CustomerId({ value }));
  }

  public static fromValue(value: string): CustomerId {
    return new CustomerId({ value });
  }
}