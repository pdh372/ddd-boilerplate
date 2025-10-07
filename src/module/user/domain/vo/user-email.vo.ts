import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { isEmail, normalizeEmail } from 'validator';

interface IUserEmailProps {
  readonly value: string; // Make readonly for extra safety
}

/**
 * User Email Value Object following DDD principles
 *
 * Characteristics:
 * - Immutable: Cannot be changed after creation
 * - Self-validating: Ensures email format correctness
 * - Equality by value: Two emails with same value are equal
 *
 * Factory Methods:
 * - validate(email): Validates and creates from external input with comprehensive validation
 * - fromValue(email): Creates from trusted source without validation (for DB reconstruction)
 */
export class UserEmail {
  private readonly _props: IUserEmailProps;

  // Constants for validation rules
  private static readonly MAX_LENGTH = 254; // RFC 5321 limit
  private static readonly MIN_LENGTH = 5; // a@b.c minimum

  private constructor(state: IUserEmailProps) {
    // Defensive programming - ensure props are frozen
    this._props = Object.freeze({ ...state });
  }

  /**
   * Gets the email value
   * @returns The normalized email string
   */
  get value(): string {
    return this._props.value;
  }

  /**
   * Value Object equality - compares by value, not reference
   * This is essential for Value Object semantics in DDD
   *
   * @param other - Another UserEmail instance to compare with
   * @returns true if both emails have the same value
   */
  public equals(other: UserEmail | null | undefined): boolean {
    if (!other || !(other instanceof UserEmail)) {
      return false;
    }
    return this._props.value === other._props.value;
  }

  /**
   * Returns string representation for debugging/logging
   * @returns The email value (safe for logging as it's not sensitive data)
   */
  public toString(): string {
    return this._props.value;
  }

  /**
   * Returns JSON representation
   * Useful for serialization/API responses
   */
  public toJSON(): string {
    return this._props.value;
  }

  /**
   * Validates and creates UserEmail from external/untrusted input
   * Uses validator.js library for robust, RFC-compliant email validation
   *
   * Use cases:
   * - User registration forms
   * - Profile updates
   * - API requests
   * - Any external data source
   *
   * @param email - Raw email string from external source
   * @returns Result containing UserEmail or validation error
   */
  public static validate(email: string): Result<UserEmail> {
    // Null/undefined/empty check
    if (!email || typeof email !== 'string') {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Email is required' },
      });
    }

    // Trim whitespace
    const trimmedEmail = email.trim();

    // Empty after trim check
    if (trimmedEmail.length === 0) {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Email cannot be empty' },
      });
    }

    // Length constraints (before validation for performance)
    if (trimmedEmail.length < this.MIN_LENGTH) {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: `Email too short (minimum ${this.MIN_LENGTH} characters)` },
      });
    }

    if (trimmedEmail.length > this.MAX_LENGTH) {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: `Email too long (maximum ${this.MAX_LENGTH} characters)` },
      });
    }

    // Format validation using validator.js (RFC compliant)
    if (!isEmail(trimmedEmail)) {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Invalid email format' },
      });
    }

    // Normalize email using validator.js
    const normalizedEmail = normalizeEmail(trimmedEmail, {
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    });

    if (normalizedEmail === false || normalizedEmail == null || normalizedEmail === '') {
      return Result.fail<UserEmail>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Email normalization failed' },
      });
    }

    return Result.ok<UserEmail>(new UserEmail({ value: normalizedEmail }));
  }

  /**
   * Creates UserEmail from trusted/validated source without additional validation
   * Use this when you're certain the email is already valid (e.g., from database)
   *
   * Use cases:
   * - Database reconstruction
   * - Internal system operations
   * - Data migration
   * - When email has already been validated
   *
   * WARNING: This bypasses all validation - use only with trusted data!
   *
   * @param email - Pre-validated email string
   * @returns UserEmail instance
   */
  public static fromValue(email: string): UserEmail {
    return new UserEmail({ value: email });
  }
}
