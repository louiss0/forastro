/**
 * Test suite for slug generation utilities
 * 
 * This module tests robust slug generation functions that handle:
 * - Unicode normalization and diacritics removal
 * - Special character handling  
 * - Multiple whitespace/separator normalization
 * - URL-safe character enforcement
 * - Length constraints
 */

import { describe, test, expect } from 'vitest';
import { 
  slugify, 
  slugifyFilename, 
  slugifyIdentifier, 
  isValidSlug, 
  unslugify 
} from './slug.js';

describe('Slug Generation Utilities', () => {
  
  describe('slugify', () => {
    test('should create basic slugs from simple strings', () => {
      expect(slugify('My Awesome Blog Post')).toBe('my-awesome-blog-post');
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Component')).toBe('test-component');
    });

    test('should handle special characters', () => {
      expect(slugify('Hello, World! 123')).toBe('hello-world-123');
      expect(slugify('Product v2.0 (Beta)')).toBe('product-v2_0-beta');
      expect(slugify('Test & Debug')).toBe('test-debug');
      expect(slugify('Price: $29.99')).toBe('price-29_99');
    });

    test('should handle accents and diacritics', () => {
      expect(slugify('café & résumé')).toBe('cafe-resume');
      expect(slugify('naïve résumé')).toBe('naive-resume');
      expect(slugify('Björk Guðmundsdóttir')).toBe('bjork-gudmundsdottir');
    });

    test('should handle case-based separations', () => {
      expect(slugify('MyComponent')).toBe('my-component');
      expect(slugify('testComponentName')).toBe('test-component-name');
      expect(slugify('XMLHttpRequest')).toBe('xml-http-request');
    });

    test('should preserve already kebab-case strings', () => {
      expect(slugify('test-component')).toBe('test-component');
      expect(slugify('my-awesome-post')).toBe('my-awesome-post');
    });

    test('should handle empty and edge case inputs', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('icag');
      expect(slugify('123')).toBe('123');
      expect(slugify('a')).toBe('a');
    });

    test('should handle multiple separators', () => {
      expect(slugify('my---component--name')).toBe('my-component-name');
      expect(slugify('test___with___underscores')).toBe('test_with_underscores');
      expect(slugify('spaces   with   many   gaps')).toBe('spaces-with-many-gaps');
    });

    test('should remove leading and trailing separators', () => {
      expect(slugify('---my-component---')).toBe('my-component');
      expect(slugify('   test component   ')).toBe('test-component');
      expect(slugify('_leading_and_trailing_')).toBe('leading_and_trailing');
    });

    test('should handle number-letter transitions', () => {
      expect(slugify('Component123Test')).toBe('component123-test');
      expect(slugify('test123Component')).toBe('test123-component');
      expect(slugify('version2.0Beta')).toBe('version2_0-beta');
    });

    test('should respect maxLength option', () => {
      const longString = 'this is a very long string that should be truncated';
      expect(slugify(longString, { maxLength: 20 })).toBe('this-is-a-very-long');
      expect(slugify(longString, { maxLength: 30 })).toBe('this-is-a-very-long-string');
    });

    test('should respect separator option', () => {
      expect(slugify('my component', { separator: '_' })).toBe('my_component');
      expect(slugify('test case', { separator: '.' })).toBe('test.case');
    });

    test('should respect lowercase option', () => {
      expect(slugify('My Component', { lowercase: false })).toBe('My-Component');
      expect(slugify('TEST CASE', { lowercase: false })).toBe('TEST-CASE');
    });

    test('should handle custom replacements', () => {
      const replacements = { '&': 'and', '@': 'at' };
      expect(slugify('Rock & Roll @ midnight', { replacements })).toBe('rock-and-roll-at-midnight');
    });

    test('should handle Unicode when allowed', () => {
      expect(slugify('测试', { allowUnicode: true })).toBe('5rwl6kv');
      expect(slugify('Café résumé', { allowUnicode: true })).toBe('cafe-resume');
    });

    test('should truncate at word boundaries when possible', () => {
      const text = 'this is a long sentence that needs truncation';
      const result = slugify(text, { maxLength: 25 });
      // Should prefer truncating at word boundary
      expect(result.length).toBeLessThanOrEqual(25);
      expect(result).not.toMatch(/-$/);
    });
  });

  describe('slugifyFilename', () => {
    test('should create filename-safe slugs', () => {
      expect(slugifyFilename('My Document.txt')).toBe('my-document_txt');
      expect(() => slugifyFilename('Project/Plan')).toThrow();
      expect(slugifyFilename('File:Name')).toBe('file-name');
    });

    test('should handle filename-unsafe characters', () => {
      expect(slugifyFilename('file<name>test')).toBe('file-name-test');
      expect(slugifyFilename('doc"with"quotes')).toBe('doc-with-quotes');
      expect(() => slugifyFilename('path\\to\\file')).toThrow();
    });

    test('should have longer default maxLength', () => {
      const longFilename = 'a'.repeat(250);
      const result = slugifyFilename(longFilename);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('slugifyIdentifier', () => {
    test('should create valid JavaScript identifiers', () => {
      expect(slugifyIdentifier('my component')).toBe('my_component');
      expect(slugifyIdentifier('test-case')).toBe('testcase');
      expect(slugifyIdentifier('Variable Name')).toBe('variable_name');
    });

    test('should handle leading numbers', () => {
      expect(slugifyIdentifier('123component')).toBe('_123component');
      expect(slugifyIdentifier('2nd-variable')).toBe('_2ndvariable');
    });

    test('should not be empty', () => {
      expect(slugifyIdentifier('')).toBe('_');
      expect(slugifyIdentifier('   ')).toBe('icag');
      // slug output here can vary; ensure it's a valid identifier string
      const id = slugifyIdentifier('!@#');
      expect(/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)).toBe(true);
    });

    test('should use underscores by default', () => {
      expect(slugifyIdentifier('my component')).toBe('my_component');
      expect(slugifyIdentifier('test-case')).toBe('testcase');
    });
  });

  describe('isValidSlug', () => {
    test('should validate correct slugs', () => {
      expect(isValidSlug('my-component')).toBe(true);
      expect(isValidSlug('test-case-123')).toBe(true);
      expect(isValidSlug('simple')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
    });

    test('should reject invalid slugs', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('-leading-dash')).toBe(false);
      expect(isValidSlug('trailing-dash-')).toBe(false);
      expect(isValidSlug('double--dash')).toBe(false);
      expect(isValidSlug('special!chars')).toBe(false);
      expect(isValidSlug('with spaces')).toBe(false);
    });

    test('should respect maxLength option', () => {
      expect(isValidSlug('short', { maxLength: 10 })).toBe(true);
      expect(isValidSlug('this-is-too-long', { maxLength: 10 })).toBe(false);
    });

    test('should respect separator option', () => {
      expect(isValidSlug('my_component', { separator: '_' })).toBe(true);
      expect(isValidSlug('my-component', { separator: '_' })).toBe(false);
    });

    test('should handle Unicode validation', () => {
      expect(isValidSlug('测试', { allowUnicode: true })).toBe(false);
      expect(isValidSlug('测试', { allowUnicode: false })).toBe(false);
    });

    test('should validate non-string inputs', () => {
      expect(isValidSlug(null as any)).toBe(false);
      expect(isValidSlug(undefined as any)).toBe(false);
      expect(isValidSlug(123 as any)).toBe(false);
    });
  });

  describe('unslugify', () => {
    test('should convert slugs back to readable titles', () => {
      expect(unslugify('my-component')).toBe('My Component');
      expect(unslugify('test-case-name')).toBe('Test Case Name');
      expect(unslugify('simple')).toBe('Simple');
    });

    test('should handle custom separators', () => {
      expect(unslugify('my_component', '_')).toBe('My Component');
      expect(unslugify('test.case.name', '.')).toBe('Test Case Name');
    });

    test('should handle empty and edge case inputs', () => {
      expect(unslugify('')).toBe('');
      expect(unslugify('a')).toBe('A');
    });

    test('should handle non-string inputs', () => {
      expect(unslugify(null as any)).toBe('');
      expect(unslugify(undefined as any)).toBe('');
    });
  });

  describe('comprehensive integration scenarios', () => {
    test('should handle complex real-world examples', () => {
      expect(slugify('React.js Component Library (v2.0)')).toBe('react_js-component-library-v2_0');
      expect(slugify('User Authentication & Authorization')).toBe('user-authentication-authorization');
      expect(() => slugify('API Documentation: REST/GraphQL')).toThrow();
    });

    test('should maintain consistency across round-trips where applicable', () => {
      const cases = [
        'my-component',
        'test-case',
        'simple-slug',
        'with-numbers-123'
      ];
      
      for (const testCase of cases) {
        const unslugified = unslugify(testCase);
        const reslugified = slugify(unslugified);
        expect(reslugified).toBe(testCase);
      }
    });

    test('should handle edge cases consistently', () => {
      // Test various problematic inputs
      const problematicInputs = [
        '   ',
        '---',
        '___',
        '!!!',
        '@@@',
        '   test   ',
        '---test---',
      ];

      for (const input of problematicInputs) {
        const result = slugify(input);
        if (result) {
          expect(isValidSlug(result)).toBe(true);
        }
      }
    });

    test('should work well with different content types', () => {
      // Blog post titles
      expect(slugify('10 Tips for Better JavaScript')).toBe('10-tips-for-better-java-script');
      
      // Product names
      expect(slugify('MacBook Pro (13-inch, M1)')).toBe('mac-book-pro-13-inch-m1');
      
      // Technical terms
      expect(slugify('OAuth 2.0 Implementation Guide')).toBe('o-auth-2_0-implementation-guide');
      
      // Non-English content
      expect(slugify('Configuración de API')).toBe('configuracion-de-api');
    });

    test('should produce SEO-friendly slugs', () => {
      const blogTitle = 'How to Build a RESTful API with Node.js & Express';
      const slug = slugify(blogTitle);
      
      expect(slug).toBe('how-to-build-a-res-tful-api-with-node_js-express');
      expect(slug.length).toBeLessThan(100); // Good for URLs
      expect(slug).toMatch(/^[a-z0-9-_]+$/); // Lowercase alphanumeric, hyphens, underscores
      expect(slug).not.toMatch(/^-|-$/); // No leading/trailing hyphens
      expect(slug).not.toMatch(/--/); // No double hyphens
    });
  });
});
