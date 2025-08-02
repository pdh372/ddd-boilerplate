import { Types } from 'mongoose';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IdProps {
  value: string;
}

export class IdVO {
  private readonly _props: IdProps;

  protected constructor(state: IdProps) {
    this._props = state;
  }

  get value(): string {
    return this._props.value;
  }

  public static generate(): ResultSpecification<IdVO> {
    return ResultSpecification.ok(new IdVO({ value: new Types.ObjectId()._id.toString() }));
  }

  public static create(value: string): ResultSpecification<IdVO> {
    if (!Types.ObjectId.isValid(value)) {
      return ResultSpecification.fail({ errorKey: TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID });
    }

    return ResultSpecification.ok(new IdVO({ value }));
  }

  public static fromValue(value: string): IdVO {
    return new IdVO({ value });
  }
}
