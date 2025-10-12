/**
 * Transform helpers for class-transformer decorators
 * Provides reusable, type-safe input sanitization functions
 */

/**
 * Trims whitespace and converts to lowercase
 * Used for email normalization to ensure case-insensitive matching
 *
 * @param value - Input value to transform
 * @returns Trimmed and lowercased string
 *
 * @example
 * trimAndLowercase('  USER@TEST.COM  ') // 'user@test.com'
 */
export function trimAndLowercase(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  return value.trim().toLowerCase();
}

/**
 * Trims whitespace from string values
 * Used for names, IDs, and general text fields
 *
 * @param value - Input value to transform
 * @returns Trimmed string
 *
 * @example
 * trimString('  John Doe  ') // 'John Doe'
 */
export function trimString(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  return value.trim();
}
