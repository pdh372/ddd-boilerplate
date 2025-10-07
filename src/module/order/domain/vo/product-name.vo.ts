import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface ProductNameProps {
  readonly value: string;
}

/**
 * Product Name Value Object
 *
 * Factory Methods:
 * - validate(name): Validates and creates from external input with length checking
 * - fromValue(name): Creates from trusted source without validation
 */
export class ProductName {
  private readonly _props: ProductNameProps;
  private static readonly _MIN_LENGTH = 1;
  private static readonly _MAX_LENGTH = 255;

  private constructor(state: ProductNameProps) {
    this._props = Object.freeze({ ...state });
  }

  get value(): string {
    return this._props.value;
  }

  /**
   * Validates and creates ProductName from external input
   * Use for: Product creation, updates, API requests
   */
  public static validate(name: string): Result<ProductName> {
    if (!this.isValidName(name)) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_PRODUCT_NAME,
      });
    }

    return Result.ok(new ProductName({ value: name.trim() }));
  }

  /**
   * Creates ProductName from trusted source without validation
   * Use for: Database reconstruction, internal operations
   */
  public static fromValue(name: string): ProductName {
    return new ProductName({ value: name });
  }

  public equals(other: ProductName): boolean {
    if (other == null || !(other instanceof ProductName)) {
      return false;
    }
    return this._props.value === other._props.value;
  }

  private static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const trimmedName = name.trim();
    return trimmedName.length >= this._MIN_LENGTH && trimmedName.length <= this._MAX_LENGTH;
  }
}
