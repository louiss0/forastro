/**
 * Utility functions for name transformations used throughout the plugin.
 * These functions ensure consistent naming conventions across all generators.
 */

/**
 * Converts a string to kebab-case (lowercase with hyphens).
 * Used for file names, routes, and slugs.
 *
 * @param s - The string to convert
 * @returns The kebab-case version of the string
 *
 * @example
 * toKebab("Hello World") // "hello-world"
 * toKebab("myComponentName") // "my-component-name"
 * toKebab("  Multiple   Spaces  ") // "multiple-spaces"
 */
export function toKebab(s: string): string {
  return (
    s
      .trim()
      // Insert hyphen before capital letters (for camelCase/PascalCase)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Converts a string to PascalCase (capitalized words with no separators).
 * Used for component names, class names, and type names.
 *
 * @param s - The string to convert
 * @returns The PascalCase version of the string
 *
 * @example
 * toPascal("hello world") // "HelloWorld"
 * toPascal("my-component") // "MyComponent"
 * toPascal("user_profile") // "UserProfile"
 */
export function toPascal(s: string): string {
  return (
    s
      .trim()
      // Insert space before capital letters (for camelCase/PascalCase)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter((w): w is string => Boolean(w))
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('')
  );
}

/**
 * Converts a string to camelCase (first word lowercase, rest capitalized).
 * Used for variable names and property names.
 *
 * @param s - The string to convert
 * @returns The camelCase version of the string
 *
 * @example
 * toCamel("hello world") // "helloWorld"
 * toCamel("my-component") // "myComponent"
 * toCamel("UserProfile") // "userProfile"
 */
export function toCamel(s: string): string {
  const pascal = toPascal(s);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
