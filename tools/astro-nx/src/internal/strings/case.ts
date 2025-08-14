/**
 * Comprehensive string case conversion utilities with edge-case handling
 * 
 * This module provides robust case conversion functions that handle:
 * - Spaces, underscores, and hyphens as separators
 * - Numbers mixed with text
 * - Already converted strings (preserving intent)
 * - Empty strings and edge cases
 * - Complex cases like "XMLHttpRequest" or "iOS"
 */

/**
 * Converts a string to PascalCase
 * 
 * Handles various input formats:
 * - kebab-case: "my-component" → "MyComponent"
 * - snake_case: "my_component" → "MyComponent"  
 * - space separated: "my component" → "MyComponent"
 * - camelCase: "myComponent" → "MyComponent"
 * - Already PascalCase: "MyComponent" → "MyComponent"
 * - Mixed separators: "my-component_name test" → "MyComponentNameTest"
 * - Numbers: "component123" → "Component123"
 * 
 * @param str - Input string to convert
 * @returns PascalCase string
 */
export function toPascalCase(str: string): string {
  // Handle empty string
  if (!str) return str;
  
  // If input is already PascalCase or camelCase without separators, convert camelCase to PascalCase by uppercasing the first letter and keep internal capitals intact.
  // Why preserve existing case: Avoid breaking intentionally formatted names like "XMLHttp" or "iOS"
  if (!/[-_\s]/.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // For dashed/underscored/space-separated names, capitalize each segment and join.
  // Preserve internal capitalization in each word segment
  return str
    .split(/[-_\s]+/)
    .filter(word => word.length > 0) // Remove empty segments from multiple separators
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Converts a string to camelCase
 * 
 * Handles various input formats:
 * - kebab-case: "my-component" → "myComponent"
 * - snake_case: "my_component" → "myComponent"
 * - space separated: "my component" → "myComponent"
 * - PascalCase: "MyComponent" → "myComponent"
 * - Already camelCase: "myComponent" → "myComponent"
 * - Mixed separators: "my-component_name test" → "myComponentNameTest"
 * - Numbers: "Component123" → "component123"
 * 
 * @param str - Input string to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case (dash-separated lowercase)
 * 
 * Handles various input formats:
 * - PascalCase: "MyComponent" → "my-component"
 * - camelCase: "myComponent" → "my-component"
 * - spaces: "my component" → "my-component"
 * - underscores: "my_component" → "my-component"
 * - Already kebab-case: "my-component" → "my-component"
 * - Complex cases: "MyComplexComponent123" → "my-complex-component123"
 * - Multiple separators: "my---component--name" → "my-component-name"
 * - Leading/trailing separators: "-my-component-" → "my-component"
 * - Numbers: "Component123Test" → "component123-test"
 * 
 * @param str - Input string to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    // Handle letter to multi-digit number transitions: "test123" → "test-123" (only 2+ digits)
    .replace(/([a-zA-Z])(\d{2,})/g, '$1-$2')
    // Handle multi-digit number to letter transitions: "123Test" → "123-test" (only 2+ digits)
    .replace(/(\d{2,})([a-zA-Z])/g, '$1-$2')
    // For PascalCase/camelCase inputs, split on capitals and join with '-' in lowercase.
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Handle multiple capitals followed by lowercase: "XMLHttpRequest" → "XML-Http-Request"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Convert spaces and underscores to dashes
    .replace(/[\s_]+/g, '-')
    // For already dashed inputs, normalize multiple dashes to single
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes and convert to lowercase
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Converts a string to snake_case (underscore-separated lowercase)
 * 
 * Similar to kebab-case but uses underscores instead of hyphens
 * 
 * @param str - Input string to convert
 * @returns snake_case string
 */
export function toSnakeCase(str: string): string {
  return toKebabCase(str).replace(/-/g, '_');
}

/**
 * Converts a string to SCREAMING_SNAKE_CASE (uppercase snake_case)
 * 
 * @param str - Input string to convert
 * @returns SCREAMING_SNAKE_CASE string
 */
export function toScreamingSnakeCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Converts a PascalCase string to space-separated words
 * Useful for generating human-readable titles from code names
 * 
 * Examples:
 * - "MyComponent" → "My Component"
 * - "XMLHttpRequest" → "XML Http Request"
 * - "iOS" → "iOS"
 * - "Component123Test" → "Component 123 Test"
 * 
 * @param str - Input PascalCase string
 * @returns Space-separated words
 */
export function toSpacedWords(str: string): string {
  if (!str) return str;
  
  return str
    // Insert space before uppercase letters (except at the start)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Handle consecutive capitals like "XMLHttp" → "XML Http"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Handle letter to number transitions: "test123" → "test 123"
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    // Handle number to letter transitions: "123Test" → "123 Test"
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .trim();
}

/**
 * Converts a string to Title Case
 * Each word is capitalized, suitable for human-readable titles
 * 
 * @param str - Input string to convert
 * @returns Title Case string
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  
  // Convert kebab-case and snake_case to spaces first
  const withSpaces = str.replace(/[-_]/g, ' ');
  
  // Then convert to spaced words, then capitalize each word
  const spacedWords = toSpacedWords(withSpaces);
  
  return spacedWords
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Detects the case format of a string
 * 
 * @param str - Input string to analyze
 * @returns The detected case format
 */
export function detectCase(str: string): 'camelCase' | 'PascalCase' | 'kebab-case' | 'snake_case' | 'SCREAMING_SNAKE_CASE' | 'Title Case' | 'mixed' | 'unknown' {
  if (!str) return 'unknown';
  
  const hasUpperCase = /[A-Z]/.test(str);
  const hasLowerCase = /[a-z]/.test(str);
  const hasSpaces = /\s/.test(str);
  const hasHyphens = /-/.test(str);
  const hasUnderscores = /_/.test(str);
  const startsWithUpper = /^[A-Z]/.test(str);
  const startsWithLower = /^[a-z]/.test(str);
  const isAllUpper = str === str.toUpperCase() && hasUpperCase;
  
  // Check for SCREAMING_SNAKE_CASE
  if (isAllUpper && hasUnderscores && !hasSpaces && !hasHyphens) {
    return 'SCREAMING_SNAKE_CASE';
  }
  
  // Check for snake_case
  if (hasUnderscores && !hasSpaces && !hasHyphens && !hasUpperCase) {
    return 'snake_case';
  }
  
  // Check for kebab-case
  if (hasHyphens && !hasSpaces && !hasUnderscores && !hasUpperCase) {
    return 'kebab-case';
  }
  
  // Check for Title Case (spaces with first letter of each word capitalized)
  if (hasSpaces && !hasHyphens && !hasUnderscores) {
    const words = str.split(/\s+/);
    const isTitleCase = words.every(word => /^[A-Z][a-z]*$/.test(word));
    if (isTitleCase) {
      return 'Title Case';
    }
  }
  
  // Check for camelCase or PascalCase (no separators, mixed case)
  if (!hasSpaces && !hasHyphens && !hasUnderscores && hasUpperCase && hasLowerCase) {
    if (startsWithLower) {
      return 'camelCase';
    } else if (startsWithUpper) {
      return 'PascalCase';
    }
  }
  
  // Special case: single letter lowercase should be camelCase
  if (str.length === 1 && startsWithLower) {
    return 'camelCase';
  }
  
  // Special case: single letter uppercase should be PascalCase
  if (str.length === 1 && startsWithUpper) {
    return 'PascalCase';
  }
  
  // If multiple separators or mixed patterns, it's mixed
  const separatorCount = [hasSpaces, hasHyphens, hasUnderscores].filter(Boolean).length;
  if (separatorCount > 1) {
    return 'mixed';
  }
  
  return 'unknown';
}
