import { ValueObjectRoot } from '@shared/domain';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObjectRoot<UserIdProps> {
  get value(): string {
    return this.state.value;
  }

  private constructor(state: UserIdProps) {
    super(state);
  }

  public static create(): UserId {
    return new UserId({ value: Math.random().toString(36) });
  }
}
