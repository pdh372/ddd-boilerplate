import { ResultSpecification } from '@shared/domain/specification';
import { ValueObjectRoot } from '@shared/domain/vo';

interface IUserNameProps {
  value: string;
}

export class UserName extends ValueObjectRoot<IUserNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(state: IUserNameProps) {
    super(state);
  }

  public static create(name: string): ResultSpecification<UserName> {
    if (!this.isValidName(name)) {
      return ResultSpecification.fail<UserName>({ errorKey: 'error.user.invalid_name' });
    }

    return ResultSpecification.ok<UserName>(new UserName({ value: name.trim() }));
  }

  public static fromValue(name: string): UserName {
    return new UserName({ value: name });
  }

  private static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const trimmedName = name.trim();
    return trimmedName.length >= 1;
  }
}