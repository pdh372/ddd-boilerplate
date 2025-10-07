import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IUserNameProps {
  readonly value: string;
}

/**
 * User Name Value Object - Simple and practical
 *
 * Factory Methods:
 * - validate(name): Validates and creates from external input
 * - fromValue(name): Creates from trusted source (database)
 */
export class UserName {
  private readonly _props: IUserNameProps;

  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private constructor(state: IUserNameProps) {
    this._props = Object.freeze({ ...state });
  }

  get value(): string {
    return this._props.value;
  }

  public equals(other: UserName | null | undefined): boolean {
    if (!other || !(other instanceof UserName)) {
      return false;
    }
    return this._props.value === other._props.value;
  }

  public toString(): string {
    return this._props.value;
  }

  /**
   * Validates and creates UserName from external/untrusted input
   */
  public static validate(name: string): ResultSpecification<UserName> {
    if (!name || typeof name !== 'string') {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { min_length: this.MIN_LENGTH, max_length: this.MAX_LENGTH },
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.MIN_LENGTH || trimmedName.length > this.MAX_LENGTH) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { min_length: this.MIN_LENGTH, max_length: this.MAX_LENGTH },
      });
    }

    return ResultSpecification.ok<UserName>(new UserName({ value: trimmedName }));
  }

  /**
   * Creates UserName from trusted source (e.g., database)
   */
  public static fromValue(name: string): UserName {
    return new UserName({ value: name });
  }
}
