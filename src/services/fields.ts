/**
 * Utility class for working with multiple fields
 * @static
 */
export class Fields {
  /**
   * Check if all fields are unchanged
   * @param {Array<{unchanged: boolean}>} fields - Array of field states
   * @returns {boolean} True if all fields match their default values
   */
  static allUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.every((field) => field.unchanged);
  }

  /**
   * Check if all fields are empty
   * @param {Array<{empty: boolean}>} fields - Array of field states
   * @returns {boolean} True if all fields are empty
   */
  static allEmpty(fields: { empty: boolean }[]): boolean {
    return fields.every((field) => field.empty);
  }

  /**
   * Check if any field is empty
   * @param {Array<{empty: boolean}>} fields - Array of field states
   * @returns {boolean} True if any field is empty
   */
  static anyEmpty(fields: { empty: boolean }[]): boolean {
    return fields.some((field) => field.empty);
  }

  /**
   * Check if any field is unchanged
   * @param {Array<{unchanged: boolean}>} fields - Array of field states
   * @returns {boolean} True if any field matches its default value
   */
  static anyUnchanged(fields: { unchanged: boolean }[]): boolean {
    return fields.some((field) => field.unchanged);
  }

  /**
   * Check if any field has changed
   * @param {Array<{changed: boolean}>} fields - Array of field states
   * @returns {boolean} True if any field differs from its default value
   */
  static anyChanged(fields: { changed: boolean }[]): boolean {
    return fields.some((field) => field.changed);
  }
}
