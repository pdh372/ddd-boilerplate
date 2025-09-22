import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { isAlpha, isLength } from 'validator';

interface IUserNameProps {
  readonly value: string; // Make readonly for extra safety
}

/**
 * User Name Value Object following DDD principles
 *
 * Characteristics:
 * - Immutable: Cannot be changed after creation
 * - Self-validating: Ensures name format correctness
 * - Equality by value: Two names with same value are equal
 *
 * Factory Methods:
 * - validate(name): Validates and creates from external input with comprehensive validation
 * - fromValue(name): Creates from trusted source without validation (for DB reconstruction)
 */
export class UserName {
  private readonly _props: IUserNameProps;

  // Constants for validation rules
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;
  private static readonly ALLOWED_PATTERN = /^[a-zA-ZÀ-ỹ\s'-]+$/; // Letters, spaces, apostrophes, hyphens

  private constructor(state: IUserNameProps) {
    // Defensive programming - ensure props are frozen
    this._props = Object.freeze({ ...state });
  }

  /**
   * Gets the name value
   * @returns The normalized name string
   */
  get value(): string {
    return this._props.value;
  }

  /**
   * Value Object equality - compares by value, not reference
   * This is essential for Value Object semantics in DDD
   *
   * @param other - Another UserName instance to compare with
   * @returns true if both names have the same value
   */
  public equals(other: UserName | null | undefined): boolean {
    if (!other || !(other instanceof UserName)) {
      return false;
    }
    return this._props.value === other._props.value;
  }

  /**
   * Returns string representation for debugging/logging
   * @returns The name value
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
   * Validates and creates UserName from external/untrusted input
   * Uses validator.js library for robust validation
   *
   * Use cases:
   * - User registration forms
   * - Profile updates
   * - Form data
   * - Any external data source
   *
   * @param name - Raw name string from external source
   * @returns ResultSpecification containing UserName or validation error
   */
  public static validate(name: string): ResultSpecification<UserName> {
    // Null/undefined/empty check
    if (!name || typeof name !== 'string') {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { reason: 'Name is required' },
      });
    }

    // Trim whitespace
    const trimmedName = name.trim();

    // Empty after trim check
    if (trimmedName.length === 0) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { reason: 'Name cannot be empty' },
      });
    }

    // Length constraints using validator.js
    if (!isLength(trimmedName, { min: this.MIN_LENGTH, max: this.MAX_LENGTH })) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: {
          reason: `Name must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`,
          min_length: this.MIN_LENGTH,
          max_length: this.MAX_LENGTH,
        },
      });
    }

    // Pattern validation - allow letters, spaces, hyphens, apostrophes
    if (!this.ALLOWED_PATTERN.test(trimmedName)) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { reason: 'Name can only contain letters, spaces, hyphens, and apostrophes' },
      });
    }

    // Additional business rules
    if (this.hasConsecutiveSpaces(trimmedName)) {
      return ResultSpecification.fail<UserName>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_NAME,
        errorParam: { reason: 'Name cannot have consecutive spaces' },
      });
    }

    // Normalize: single spaces between words, proper case
    const normalizedName = this.normalizeName(trimmedName);

    return ResultSpecification.ok<UserName>(new UserName({ value: normalizedName }));
  }

  /**
   * Creates UserName from trusted/validated source without additional validation
   * Use this when you're certain the name is already valid (e.g., from database)
   *
   * Use cases:
   * - Database reconstruction
   * - Internal system operations
   * - Data migration
   * - When name has already been validated
   *
   * WARNING: This bypasses all validation - use only with trusted data!
   *
   * @param name - Pre-validated name string
   * @returns UserName instance
   */
  public static fromValue(name: string): UserName {
    return new UserName({ value: name });
  }

  /**
   * Checks for consecutive spaces in name
   * @param name - Name to check
   * @returns true if has consecutive spaces
   */
  private static hasConsecutiveSpaces(name: string): boolean {
    return /\s{2,}/.test(name);
  }

  /**
   * Normalizes name by removing extra spaces and capitalizing properly
   * @param name - Name to normalize
   * @returns Normalized name
   */
  private static normalizeName(name: string): string {
    return name
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
