import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';

interface ProductIdProps {
  value: string;
}

export class ProductId extends IdVO {
  constructor(props: ProductIdProps) {
    super(props);
  }

  public static init(): ProductId {
    const baseId = super.init();
    return new ProductId({ value: baseId.value });
  }

  public static validate(value: string): ResultSpecification<ProductId> {
    const result = super.validate(value);
    if (result.isFailure) {
      return ResultSpecification.fail(result.error);
    }
    return ResultSpecification.ok(new ProductId({ value }));
  }

  public static fromValue(value: string): ProductId {
    return new ProductId({ value });
  }
}
