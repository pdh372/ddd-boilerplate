import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';

interface UserIdProps {
  value: string;
}

export class UserId extends IdVO {
  constructor(props: UserIdProps) {
    super(props);
  }

  public static init(): UserId {
    const baseId = super.init();
    return new UserId({ value: baseId.value });
  }

  public static create(value: string): ResultSpecification<UserId> {
    const result = super.create(value);
    if (result.isFailure) {
      return ResultSpecification.fail(result.error);
    }
    return ResultSpecification.ok(new UserId({ value }));
  }

  public static fromValue(value: string): UserId {
    return new UserId({ value });
  }
}
