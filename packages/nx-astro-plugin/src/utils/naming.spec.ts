import { describe, it, expect } from 'vitest';
import { toKebab, toPascal, toCamel } from './naming.js';

describe('naming utilities', () => {
  describe('toKebab', () => {
    it('converts space-separated words to kebab-case', () => {
      expect(toKebab('Hello World')).toBe('hello-world');
      expect(toKebab('My Component Name')).toBe('my-component-name');
    });

    it('converts PascalCase to kebab-case', () => {
      expect(toKebab('MyComponentName')).toBe('my-component-name');
      expect(toKebab('UserProfile')).toBe('user-profile');
    });

    it('converts camelCase to kebab-case', () => {
      expect(toKebab('myComponentName')).toBe('my-component-name');
      expect(toKebab('userProfile')).toBe('user-profile');
    });

    it('handles underscores', () => {
      expect(toKebab('my_component_name')).toBe('my-component-name');
      expect(toKebab('user_profile')).toBe('user-profile');
    });

    it('handles multiple separators', () => {
      expect(toKebab('my---component___name')).toBe('my-component-name');
      expect(toKebab('hello   world')).toBe('hello-world');
    });

    it('trims leading and trailing spaces', () => {
      expect(toKebab('  hello world  ')).toBe('hello-world');
      expect(toKebab('   my-component   ')).toBe('my-component');
    });

    it('removes leading and trailing hyphens', () => {
      expect(toKebab('-hello-world-')).toBe('hello-world');
      expect(toKebab('---my-component---')).toBe('my-component');
    });

    it('handles numbers', () => {
      expect(toKebab('Component123')).toBe('component123');
      expect(toKebab('My Component 2')).toBe('my-component-2');
    });

    it('handles special characters', () => {
      expect(toKebab('hello@world')).toBe('hello-world');
      expect(toKebab('my#component$name')).toBe('my-component-name');
    });

    it('returns empty string for empty input', () => {
      expect(toKebab('')).toBe('');
      expect(toKebab('   ')).toBe('');
    });
  });

  describe('toPascal', () => {
    it('converts space-separated words to PascalCase', () => {
      expect(toPascal('hello world')).toBe('HelloWorld');
      expect(toPascal('my component name')).toBe('MyComponentName');
    });

    it('converts kebab-case to PascalCase', () => {
      expect(toPascal('my-component-name')).toBe('MyComponentName');
      expect(toPascal('user-profile')).toBe('UserProfile');
    });

    it('converts camelCase to PascalCase', () => {
      expect(toPascal('myComponentName')).toBe('MyComponentName');
      expect(toPascal('userProfile')).toBe('UserProfile');
    });

    it('handles underscores', () => {
      expect(toPascal('my_component_name')).toBe('MyComponentName');
      expect(toPascal('user_profile')).toBe('UserProfile');
    });

    it('handles mixed case input', () => {
      expect(toPascal('HELLO WORLD')).toBe('HelloWorld');
      expect(toPascal('MixedCase Words')).toBe('MixedCaseWords');
    });

    it('handles numbers', () => {
      expect(toPascal('component 123')).toBe('Component123');
      expect(toPascal('my-component-2')).toBe('MyComponent2');
    });

    it('handles special characters', () => {
      expect(toPascal('hello@world')).toBe('HelloWorld');
      expect(toPascal('my#component$name')).toBe('MyComponentName');
    });

    it('handles multiple separators', () => {
      expect(toPascal('my---component___name')).toBe('MyComponentName');
      expect(toPascal('hello   world')).toBe('HelloWorld');
    });

    it('returns empty string for empty input', () => {
      expect(toPascal('')).toBe('');
      expect(toPascal('   ')).toBe('');
    });
  });

  describe('toCamel', () => {
    it('converts space-separated words to camelCase', () => {
      expect(toCamel('hello world')).toBe('helloWorld');
      expect(toCamel('my component name')).toBe('myComponentName');
    });

    it('converts kebab-case to camelCase', () => {
      expect(toCamel('my-component-name')).toBe('myComponentName');
      expect(toCamel('user-profile')).toBe('userProfile');
    });

    it('converts PascalCase to camelCase', () => {
      expect(toCamel('MyComponentName')).toBe('myComponentName');
      expect(toCamel('UserProfile')).toBe('userProfile');
    });

    it('handles underscores', () => {
      expect(toCamel('my_component_name')).toBe('myComponentName');
      expect(toCamel('user_profile')).toBe('userProfile');
    });

    it('handles numbers', () => {
      expect(toCamel('component 123')).toBe('component123');
      expect(toCamel('my-component-2')).toBe('myComponent2');
    });

    it('handles special characters', () => {
      expect(toCamel('hello@world')).toBe('helloWorld');
      expect(toCamel('my#component$name')).toBe('myComponentName');
    });

    it('returns empty string for empty input', () => {
      expect(toCamel('')).toBe('');
      expect(toCamel('   ')).toBe('');
    });
  });

  describe('consistency between transformations', () => {
    it('toKebab and toPascal produce consistent results', () => {
      const input = 'My Component Name';
      const kebab = toKebab(input);
      const pascal = toPascal(kebab);
      expect(pascal).toBe('MyComponentName');
    });

    it('toPascal and toCamel produce consistent results', () => {
      const input = 'My Component Name';
      const pascal = toPascal(input);
      const camel = toCamel(input);
      expect(pascal.charAt(0).toLowerCase() + pascal.slice(1)).toBe(camel);
    });
  });
});
