/**
 * Consolidated string utilities for Astro NX generators
 * 
 * This module provides a single entry point for all string manipulation utilities
 * including case conversion, slug generation, and path normalization.
 */

// Export all case conversion utilities
export {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toScreamingSnakeCase,
  toSpacedWords,
  toTitleCase,
  detectCase
} from './case.js';

// Export all slug generation utilities
export {
  slugify,
  slugifyFilename,
  slugifyIdentifier,
  isValidSlug,
  unslugify,
  type SlugifyOptions
} from './slug.js';

// Re-export for convenience - commonly used together
export type {
  // No types from case.js as it only exports functions
} from './case.js';

/**
 * Common utility combinations for typical use cases
 */

/**
 * Create a component name in PascalCase suitable for React/Astro components
 * @param input - Input string to convert
 * @returns PascalCase component name
 */
export function toComponentName(input: string): string {
  return toPascalCase(input);
}

/**
 * Create a filename in kebab-case suitable for file systems
 * @param input - Input string to convert  
 * @returns kebab-case filename
 */
export function toFileName(input: string): string {
  return toKebabCase(input);
}

/**
 * Create a CSS class name in kebab-case
 * @param input - Input string to convert
 * @returns kebab-case CSS class name
 */
export function toCssClassName(input: string): string {
  return toKebabCase(input);
}

/**
 * Create a URL-safe slug
 * @param input - Input string to convert
 * @returns URL-safe slug
 */
export function toUrlSlug(input: string): string {
  return slugify(input);
}

/**
 * Create a variable name in camelCase suitable for JavaScript
 * @param input - Input string to convert
 * @returns camelCase variable name
 */
export function toVariableName(input: string): string {
  return toCamelCase(input);
}

/**
 * Common transformation object for a single input
 */
export interface StringTransformations {
  /** Original input */
  original: string;
  /** PascalCase - suitable for component names */
  pascal: string;
  /** camelCase - suitable for variable names */
  camel: string;
  /** kebab-case - suitable for filenames and CSS classes */
  kebab: string;
  /** snake_case - suitable for constants and database fields */
  snake: string;
  /** SCREAMING_SNAKE_CASE - suitable for constants */
  constant: string;
  /** URL-safe slug */
  slug: string;
  /** Human-readable title */
  title: string;
}

/**
 * Transform a string into all common formats at once
 * @param input - Input string to transform
 * @returns Object containing all transformations
 */
export function transformAll(input: string): StringTransformations {
  return {
    original: input,
    pascal: toPascalCase(input),
    camel: toCamelCase(input),
    kebab: toKebabCase(input),
    snake: toSnakeCase(input),
    constant: toScreamingSnakeCase(input),
    slug: slugify(input),
    title: toTitleCase(input)
  };
}

// Import the necessary functions
import { 
  toPascalCase, 
  toCamelCase, 
  toKebabCase, 
  toSnakeCase, 
  toScreamingSnakeCase, 
  toTitleCase 
} from './case.js';
import { slugify } from './slug.js';
