import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IUserNameProps {
  value: string;
}

/**
 * User Name Value Object
 * 
 * Factory Methods:
 * - validate(name): Validates and creates from user input with length checking and trimming
 * - fromValue(name): Creates from trusted source without validation
 */
export class UserName {
  private readonly _props: IUserNameProps;
  private static readonly _MIN_LENGTH = 1;

  get value(): string {
    return this._props.value;
  }

  private constructor(state: IUserNameProps) {
    this._props = state;
  }

  /**
   * Validates and creates UserName from external input
   * Use for: User registration, profile updates, form data
   */
  public static validate(name: string): ResultSpecification<UserName> {
    if (!this.isValidName(name)) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { min_length: this._MIN_LENGTH },
      });
    }

    return ResultSpecification.ok<UserName>(new UserName({ value: name.trim() }));
  }

  /**
   * Creates UserName from trusted source without validation
   * Use for: Database reconstruction, internal operations
   */
  public static fromValue(name: string): UserName {
    return new UserName({ value: name });
  }

  private static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const trimmedName = name.trim();
    return trimmedName.length >= this._MIN_LENGTH;
  }
}
