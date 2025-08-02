import { ValueObjectRoot } from '@shared/domain/vo';
import { Types } from 'mongoose';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_CONFIG } from '../../../../shared/translator';
import { TRANSLATOR_KEY } from '../../../../shared/translator/translator.config';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObjectRoot<UserIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(state: UserIdProps) {
    super(state);
  }

  public static generate(): ResultSpecification<UserId> {
    return ResultSpecification.ok(new UserId({ value: new Types.ObjectId()._id.toString() }));
  }

  public static create(value: string): ResultSpecification<UserId> {
    if (!Types.ObjectId.isValid(value)) {
      return ResultSpecification.fail({ errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_ID });
    }

    return ResultSpecification.ok(new UserId({ value }));
  }

  public static fromValue(value: string): UserId {
    return new UserId({ value });
  }
}
