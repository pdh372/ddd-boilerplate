import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IUserEmailProps {
  value: string;
}

/**
 * User Email Value Object
 * 
 * Factory Methods:
 * - validate(email): Validates and creates from user input with email format checking
 * - fromValue(email): Creates from trusted source without validation
 */
export class UserEmail {
  private readonly _props: IUserEmailProps;

  private constructor(state: IUserEmailProps) {
    this._props = state;
  }

  get value(): string {
    return this._props.value;
  }

  /**
   * Validates and creates UserEmail from external input
   * Use for: User registration, profile updates, API requests
   */
  public static validate(email: string): ResultSpecification<UserEmail> {
    if (!this.isValidEmail(email)) {
      return ResultSpecification.fail<UserEmail>({ errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL });
    }

    return ResultSpecification.ok<UserEmail>(new UserEmail({ value: email }));
  }

  /**
   * Creates UserEmail from trusted source without validation
   * Use for: Database reconstruction, internal operations
   */
  public static fromValue(email: string): UserEmail {
    return new UserEmail({ value: email });
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
