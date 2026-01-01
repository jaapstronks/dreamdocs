/**
 * Validation Utilities
 * Form validation with focus-key navigation.
 */

import { focusByKey } from './dom.js';

/**
 * @typedef {Object} ValidationIssue
 * @property {'error'|'warning'} type
 * @property {string} message
 * @property {string} [focusKey] - data-focus-key attribute to focus on error
 * @property {string} [field] - Field name for programmatic access
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {ValidationIssue[]} issues
 */

/**
 * Create a validation result
 * @param {ValidationIssue[]} issues
 * @returns {ValidationResult}
 */
export function createValidationResult(issues = []) {
  const errors = issues.filter((i) => i.type === 'error');
  return {
    valid: errors.length === 0,
    issues,
  };
}

/**
 * Common validators
 */
export const validators = {
  /**
   * Check if value is not empty
   * @param {string} value
   * @param {string} fieldName
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  required(value, fieldName, focusKey) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return {
        type: 'error',
        message: `${fieldName} is required`,
        focusKey,
        field: fieldName,
      };
    }
    return null;
  },

  /**
   * Check minimum length
   * @param {string} value
   * @param {number} min
   * @param {string} fieldName
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  minLength(value, min, fieldName, focusKey) {
    if (value && value.length < min) {
      return {
        type: 'error',
        message: `${fieldName} must be at least ${min} characters`,
        focusKey,
        field: fieldName,
      };
    }
    return null;
  },

  /**
   * Check maximum length
   * @param {string} value
   * @param {number} max
   * @param {string} fieldName
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  maxLength(value, max, fieldName, focusKey) {
    if (value && value.length > max) {
      return {
        type: 'error',
        message: `${fieldName} must be at most ${max} characters`,
        focusKey,
        field: fieldName,
      };
    }
    return null;
  },

  /**
   * Check email format
   * @param {string} value
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  email(value, focusKey) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return {
        type: 'error',
        message: 'Invalid email address',
        focusKey,
        field: 'email',
      };
    }
    return null;
  },

  /**
   * Check URL format
   * @param {string} value
   * @param {string} fieldName
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  url(value, fieldName, focusKey) {
    if (value) {
      try {
        new URL(value);
      } catch {
        return {
          type: 'error',
          message: `${fieldName} must be a valid URL`,
          focusKey,
          field: fieldName,
        };
      }
    }
    return null;
  },

  /**
   * Check pattern match
   * @param {string} value
   * @param {RegExp} pattern
   * @param {string} message
   * @param {string} fieldName
   * @param {string} [focusKey]
   * @returns {ValidationIssue|null}
   */
  pattern(value, pattern, message, fieldName, focusKey) {
    if (value && !pattern.test(value)) {
      return {
        type: 'error',
        message,
        focusKey,
        field: fieldName,
      };
    }
    return null;
  },
};

/**
 * Run validation and collect issues
 * @param {Array<() => ValidationIssue|null>} checks
 * @returns {ValidationResult}
 */
export function validate(checks) {
  const issues = [];

  for (const check of checks) {
    const issue = check();
    if (issue) {
      issues.push(issue);
    }
  }

  return createValidationResult(issues);
}

/**
 * Focus the first error in a validation result
 * @param {ValidationResult} result
 * @returns {boolean} Whether an error was focused
 */
export function focusFirstError(result) {
  const firstError = result.issues.find((i) => i.type === 'error' && i.focusKey);
  if (firstError && firstError.focusKey) {
    return focusByKey(firstError.focusKey);
  }
  return false;
}

/**
 * Get error message for a specific field
 * @param {ValidationResult} result
 * @param {string} field
 * @returns {string|null}
 */
export function getFieldError(result, field) {
  const issue = result.issues.find((i) => i.field === field && i.type === 'error');
  return issue ? issue.message : null;
}

/**
 * Check if a field has an error
 * @param {ValidationResult} result
 * @param {string} field
 * @returns {boolean}
 */
export function hasFieldError(result, field) {
  return result.issues.some((i) => i.field === field && i.type === 'error');
}
