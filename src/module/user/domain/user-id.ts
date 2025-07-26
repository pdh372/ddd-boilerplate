import { ValueObject } from '../../../shared/domain/value-object';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObject<UserIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserIdProps) {
    super(props);
  }

  public static create(value: string): UserId {
    return new UserId({ value });
  }
}
