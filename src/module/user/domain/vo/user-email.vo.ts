import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IUserEmailProps {
  value: string;
}

export class UserEmail {
  private readonly _props: IUserEmailProps;

  private constructor(state: IUserEmailProps) {
    this._props = state;
  }

  get value(): string {
    return this._props.value;
  }

  public static create(email: string): ResultSpecification<UserEmail> {
    if (!this.isValidEmail(email)) {
      return ResultSpecification.fail<UserEmail>({ errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL });
    }

    return ResultSpecification.ok<UserEmail>(new UserEmail({ value: email }));
  }

  public static fromValue(email: string): UserEmail {
    return new UserEmail({ value: email });
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
