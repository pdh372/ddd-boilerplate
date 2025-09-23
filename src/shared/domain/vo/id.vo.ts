import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IIdProps {
  readonly value: string;
}

/**
 * ID Value Object - Simple and practical
 *
 * Factory Methods:
 * - generate(): Creates new UUID for new entities
 * - validate(value): Validates external input (API, forms)
 * - fromValue(value): Creates from database without validation
 * - createPlaceholder(): Temporary ID for new aggregates (MongoDB will generate real ID)
 */
export class IdVO {
  private readonly _props: IIdProps;

  private constructor(state: IIdProps) {
    this._props = Object.freeze({ ...state });
  }

  get value(): string {
    return this._props.value;
  }

  public equals(other: IdVO | null | undefined): boolean {
    if (!other || !(other instanceof IdVO)) {
      return false;
    }
    return this._props.value === other._props.value;
  }

  public toString(): string {
    return this._props.value;
  }

  public isPlaceholder(): boolean {
    return this._props.value === 'PENDING_DB_GENERATION';
  }

  /**
   * Generate new UUID for new entities (if not using DB-generated IDs)
   */
  public static generate(): IdVO {
    return new IdVO({ value: uuidv4() });
  }

  /**
   * Create from database - no validation needed
   */
  public static fromValue(value: string): IdVO {
    return new IdVO({ value });
  }

  /**
   * Validate external input (API, forms, etc.)
   */
  public static validate(value: string): ResultSpecification<IdVO> {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return ResultSpecification.fail<IdVO>({
        errorKey: TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID,
      });
    }

    const trimmed = value.trim();

    // Accept MongoDB ObjectId or UUID
    if (Types.ObjectId.isValid(trimmed) || this.isValidUUID(trimmed)) {
      return ResultSpecification.ok<IdVO>(new IdVO({ value: trimmed }));
    }

    return ResultSpecification.fail<IdVO>({
      errorKey: TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID,
    });
  }

  /**
   * Placeholder for new aggregates - MongoDB will generate real ID
   */
  public static createPlaceholder(): IdVO {
    return new IdVO({ value: 'PENDING_DB_GENERATION' });
  }

  private static isValidUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
