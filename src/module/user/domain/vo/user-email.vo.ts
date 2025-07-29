import { ResultSpecification } from '@shared/domain/specification';
import { ValueObjectRoot } from '@shared/domain/vo';

interface IUserEmailProps {
  value: string;
}

export class UserEmail extends ValueObjectRoot<IUserEmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(state: IUserEmailProps) {
    super(state);
  }

  public static create(email: string): ResultSpecification<UserEmail> {
    if (!this.isValidEmail(email)) {
      return ResultSpecification.fail<UserEmail>({ errorKey: 'error.user.invalid_email' });
    }

    return ResultSpecification.ok<UserEmail>(new UserEmail({ value: email }));
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
