import { ValueObjectRoot } from '@shared/domain/vo';

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

  public static generate(): UserId {
    return new UserId({ value: Math.random().toString(36) });
  }

  public static fromValue(value: string): UserId {
    return new UserId({ value });
  }
}
