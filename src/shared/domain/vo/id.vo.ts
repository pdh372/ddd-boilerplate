import { Types } from 'mongoose';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

interface IdProps {
  value: string;
}

/**
 * Base Value Object for identifiers following DDD patterns
 *
 * Factory Methods:
 * - init(): Creates new ID with auto-generated value (for new entities)
 * - validate(value): Validates and creates ID from external input (user input, API)
 * - fromValue(value): Creates ID from trusted value without validation (from database)
 */
export class IdVO {
  private readonly _props: IdProps;

  protected constructor(state: IdProps) {
    this._props = state;
  }

  get value(): string {
    return this._props.value;
  }

  /**
   * Creates ID from trusted value without validation
   * Use for: Reconstructing from database, internal operations
   */
  public static fromValue(value: string): IdVO {
    return new IdVO({ value });
  }

  /**
   * Validates and creates ID from external value
   * Use for: User input, API requests, untrusted sources
   */
  public static validate(value: string): ResultSpecification<IdVO> {
    if (!Types.ObjectId.isValid(value)) {
      return ResultSpecification.fail({ errorKey: TRANSLATOR_KEY.ERROR__COMMON__INVALID_ID });
    }

    return ResultSpecification.ok(new IdVO({ value }));
  }

  public static fromValueCreation(): IdVO {
    return new IdVO({ value: 'VALUE_CREATION' });
  }
}
