/**
 * Test suite for case conversion utilities
 * 
 * This module tests comprehensive case conversion functions that handle:
 * - Spaces, underscores, and hyphens as separators
 * - Numbers mixed with text  
 * - Already converted strings (preserving intent)
 * - Empty strings and edge cases
 * - Complex cases like "XMLHttpRequest" or "iOS"
 */

import { describe, test, expect } from 'vitest';
import { 
  toPascalCase, 
  toCamelCase, 
  toKebabCase, 
  toSnakeCase, 
  toScreamingSnakeCase, 
  toSpacedWords, 
  toTitleCase, 
  detectCase 
} from './case.js';

describe('String Case Conversion Utilities', () => {
  
  describe('toPascalCase', () => {
    test('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('my-component')).toBe('MyComponent');
      expect(toPascalCase('test-component-name')).toBe('TestComponentName');
    });

    test('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('my_component')).toBe('MyComponent');
      expect(toPascalCase('test_component_name')).toBe('TestComponentName');
    });

    test('should convert space separated to PascalCase', () => {
      expect(toPascalCase('my component')).toBe('MyComponent');
      expect(toPascalCase('test component name')).toBe('TestComponentName');
    });

    test('should handle single words', () => {
      expect(toPascalCase('component')).toBe('Component');
      expect(toPascalCase('test')).toBe('Test');
    });

    test('should handle already PascalCase', () => {
      expect(toPascalCase('MyComponent')).toBe('MyComponent');
      expect(toPascalCase('TestComponentName')).toBe('TestComponentName');
    });

    test('should convert camelCase to PascalCase by uppercasing first letter', () => {
      expect(toPascalCase('myComponent')).toBe('MyComponent');
      expect(toPascalCase('testComponentName')).toBe('TestComponentName');
    });

    test('should handle mixed separators', () => {
      expect(toPascalCase('my-component_name test')).toBe('MyComponentNameTest');
      expect(toPascalCase('test_case-with various')).toBe('TestCaseWithVarious');
    });

    test('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });

    test('should preserve internal capitals in already PascalCase/camelCase without separators', () => {
      expect(toPascalCase('MyComplexComponent')).toBe('MyComplexComponent');
      expect(toPascalCase('myComplexComponent')).toBe('MyComplexComponent');
      expect(toPascalCase('XMLHttpRequest')).toBe('XMLHttpRequest');
      expect(toPascalCase('iOS')).toBe('IOS'); // Note: edge case behavior
    });

    test('should handle numbers', () => {
      expect(toPascalCase('component123')).toBe('Component123');
      expect(toPascalCase('test-component-2')).toBe('TestComponent2');
      expect(toPascalCase('version_2_0')).toBe('Version20');
    });

    test('should filter out empty segments from multiple separators', () => {
      expect(toPascalCase('my--component')).toBe('MyComponent');
      expect(toPascalCase('test__case')).toBe('TestCase');
      expect(toPascalCase('name   with   spaces')).toBe('NameWithSpaces');
    });
  });

  describe('toCamelCase', () => {
    test('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('my-component')).toBe('myComponent');
      expect(toCamelCase('test-component-name')).toBe('testComponentName');
    });

    test('should convert snake_case to camelCase', () => {
      expect(toCamelCase('my_component')).toBe('myComponent');
      expect(toCamelCase('test_component_name')).toBe('testComponentName');
    });

    test('should convert space separated to camelCase', () => {
      expect(toCamelCase('my component')).toBe('myComponent');
      expect(toCamelCase('test component name')).toBe('testComponentName');
    });

    test('should handle single words', () => {
      expect(toCamelCase('component')).toBe('component');
      expect(toCamelCase('test')).toBe('test');
    });

    test('should handle already camelCase', () => {
      expect(toCamelCase('myComponent')).toBe('myComponent');
      expect(toCamelCase('testComponentName')).toBe('testComponentName');
    });

    test('should convert PascalCase to camelCase', () => {
      expect(toCamelCase('MyComponent')).toBe('myComponent');
      expect(toCamelCase('TestComponentName')).toBe('testComponentName');
    });

    test('should handle mixed separators', () => {
      expect(toCamelCase('my-component_name test')).toBe('myComponentNameTest');
    });

    test('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });

    test('should handle numbers', () => {
      expect(toCamelCase('Component123')).toBe('component123');
      expect(toCamelCase('test-component-2')).toBe('testComponent2');
    });
  });

  describe('toKebabCase', () => {
    test('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('MyComponent')).toBe('my-component');
      expect(toKebabCase('TestComponentName')).toBe('test-component-name');
    });

    test('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('myComponent')).toBe('my-component');
      expect(toKebabCase('testComponentName')).toBe('test-component-name');
    });

    test('should convert spaces to hyphens', () => {
      expect(toKebabCase('my component')).toBe('my-component');
      expect(toKebabCase('test component name')).toBe('test-component-name');
    });

    test('should convert underscores to hyphens', () => {
      expect(toKebabCase('my_component')).toBe('my-component');
      expect(toKebabCase('test_component_name')).toBe('test-component-name');
    });

    test('should handle already kebab-case', () => {
      expect(toKebabCase('my-component')).toBe('my-component');
      expect(toKebabCase('test-component-name')).toBe('test-component-name');
    });

    test('should handle complex cases', () => {
      expect(toKebabCase('MyComplexComponent123')).toBe('my-complex-component123');
      expect(toKebabCase('XMLHttpRequest')).toBe('xml-http-request');
    });

    test('should handle single words', () => {
      expect(toKebabCase('Component')).toBe('component');
      expect(toKebabCase('component')).toBe('component');
    });

    test('should normalize multiple dashes to single dash', () => {
      expect(toKebabCase('my---component--name')).toBe('my-component-name');
    });

    test('should remove leading and trailing dashes', () => {
      expect(toKebabCase('-my-component-')).toBe('my-component');
    });

    test('should handle number transitions', () => {
      expect(toKebabCase('Component123Test')).toBe('component123-test');
      expect(toKebabCase('test123Component')).toBe('test123-component');
    });

    test('should handle mixed case with numbers', () => {
      expect(toKebabCase('MyComponent2Test')).toBe('my-component2-test');
    });
  });

  describe('toSnakeCase', () => {
    test('should convert various cases to snake_case', () => {
      expect(toSnakeCase('MyComponent')).toBe('my_component');
      expect(toSnakeCase('myComponent')).toBe('my_component');
      expect(toSnakeCase('my-component')).toBe('my_component');
      expect(toSnakeCase('my component')).toBe('my_component');
    });

    test('should handle complex cases', () => {
      expect(toSnakeCase('MyComplexComponent123')).toBe('my_complex_component123');
      expect(toSnakeCase('XMLHttpRequest')).toBe('xml_http_request');
    });
  });

  describe('toScreamingSnakeCase', () => {
    test('should convert to SCREAMING_SNAKE_CASE', () => {
      expect(toScreamingSnakeCase('MyComponent')).toBe('MY_COMPONENT');
      expect(toScreamingSnakeCase('myComponent')).toBe('MY_COMPONENT');
      expect(toScreamingSnakeCase('my-component')).toBe('MY_COMPONENT');
    });
  });

  describe('toSpacedWords', () => {
    test('should convert PascalCase to spaced words', () => {
      expect(toSpacedWords('MyComponent')).toBe('My Component');
      expect(toSpacedWords('TestComponentName')).toBe('Test Component Name');
    });

    test('should handle consecutive capitals', () => {
      expect(toSpacedWords('XMLHttpRequest')).toBe('XML Http Request');
      expect(toSpacedWords('APIResponse')).toBe('API Response');
    });

    test('should handle empty string', () => {
      expect(toSpacedWords('')).toBe('');
    });

    test('should handle single words', () => {
      expect(toSpacedWords('Component')).toBe('Component');
      expect(toSpacedWords('test')).toBe('test');
    });

    test('should handle number transitions', () => {
      expect(toSpacedWords('Component123Test')).toBe('Component 123 Test');
      expect(toSpacedWords('test123Component')).toBe('test 123 Component');
    });

    test('should preserve single letters', () => {
      expect(toSpacedWords('iOS')).toBe('i OS');
      expect(toSpacedWords('A')).toBe('A');
    });
  });

  describe('toTitleCase', () => {
    test('should convert to Title Case', () => {
      expect(toTitleCase('MyComponent')).toBe('My Component');
      expect(toTitleCase('myComponent')).toBe('My Component');
      expect(toTitleCase('my-component')).toBe('My Component');
    });

    test('should handle complex cases', () => {
      expect(toTitleCase('XMLHttpRequest')).toBe('Xml Http Request');
      expect(toTitleCase('Component123Test')).toBe('Component 123 Test');
    });

    test('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('detectCase', () => {
    test('should detect camelCase', () => {
      expect(detectCase('myComponent')).toBe('camelCase');
      expect(detectCase('testComponentName')).toBe('camelCase');
    });

    test('should detect PascalCase', () => {
      expect(detectCase('MyComponent')).toBe('PascalCase');
      expect(detectCase('TestComponentName')).toBe('PascalCase');
    });

    test('should detect kebab-case', () => {
      expect(detectCase('my-component')).toBe('kebab-case');
      expect(detectCase('test-component-name')).toBe('kebab-case');
    });

    test('should detect snake_case', () => {
      expect(detectCase('my_component')).toBe('snake_case');
      expect(detectCase('test_component_name')).toBe('snake_case');
    });

    test('should detect SCREAMING_SNAKE_CASE', () => {
      expect(detectCase('MY_COMPONENT')).toBe('SCREAMING_SNAKE_CASE');
      expect(detectCase('TEST_COMPONENT_NAME')).toBe('SCREAMING_SNAKE_CASE');
    });

    test('should detect Title Case', () => {
      expect(detectCase('My Component')).toBe('Title Case');
      expect(detectCase('Test Component Name')).toBe('Title Case');
    });

    test('should detect mixed patterns', () => {
      expect(detectCase('my-component_name')).toBe('mixed');
      expect(detectCase('My-Component Name')).toBe('mixed');
    });

    test('should handle unknown patterns', () => {
      expect(detectCase('123')).toBe('unknown');
      expect(detectCase('test@#$')).toBe('unknown');
      expect(detectCase('')).toBe('unknown');
    });

    test('should handle edge cases', () => {
      expect(detectCase('a')).toBe('camelCase'); // single lowercase letter
      expect(detectCase('A')).toBe('PascalCase'); // single uppercase letter
      expect(detectCase('123component')).toBe('unknown'); // starts with number
    });
  });

  describe('edge cases and comprehensive scenarios', () => {
    test('should handle empty and whitespace-only inputs', () => {
      expect(toPascalCase('')).toBe('');
      expect(toCamelCase('')).toBe('');
      expect(toKebabCase('')).toBe('');
      expect(toSnakeCase('')).toBe('');
    });

    test('should handle single character inputs', () => {
      expect(toPascalCase('a')).toBe('A');
      expect(toCamelCase('A')).toBe('a');
      expect(toKebabCase('A')).toBe('a');
    });

    test('should handle numbers at boundaries', () => {
      expect(toPascalCase('component-2-test')).toBe('Component2Test');
      expect(toKebabCase('Component2Test')).toBe('component2-test');
    });

    test('should handle consecutive separators', () => {
      expect(toPascalCase('my--component__name  test')).toBe('MyComponentNameTest');
      expect(toKebabCase('my---component___name')).toBe('my-component-name');
    });

    test('should preserve meaningful casing for acronyms when possible', () => {
      // When input has separators, we split on separators and capitalize each part
      expect(toPascalCase('xml-http-request')).toBe('XmlHttpRequest');
      // When input has no separators, we preserve existing casing
      expect(toPascalCase('XMLHttpRequest')).toBe('XMLHttpRequest');
    });
  });
});
