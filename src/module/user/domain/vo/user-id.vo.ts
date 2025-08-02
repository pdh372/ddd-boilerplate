import { ValueObjectRoot } from '@shared/domain/vo';
import { Types } from 'mongoose';
import { ResultSpecification } from '@shared/domain/specification';

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

  public static fromValue(value: string): UserId {
    return new UserId({ value });
  }
}
