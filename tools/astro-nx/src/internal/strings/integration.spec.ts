/**
 * Integration tests for consolidated string utilities
 * 
 * This module tests the integration between case conversion, slug generation,
 * and path generation utilities to ensure they work together cohesively.
 */

import { describe, test, expect } from 'vitest';
import { toPascalCase, toCamelCase, toKebabCase, toSpacedWords, toTitleCase } from './case.js';
import { slugify, slugifyFilename, isValidSlug, unslugify } from './slug.js';

describe('String Utilities Integration', () => {

  describe('Case conversion pipeline', () => {
    test('should convert through different case formats consistently', () => {
      const input = 'myAwesome Component';
      
      const pascal = toPascalCase(input);
      const camel = toCamelCase(pascal);
      const kebab = toKebabCase(camel);
      const slug = slugify(kebab);
      
      expect(pascal).toBe('MyAwesomeComponent');
      expect(camel).toBe('myAwesomeComponent'); 
      expect(kebab).toBe('my-awesome-component');
      expect(slug).toBe('my-awesome-component');
      expect(isValidSlug(slug)).toBe(true);
    });

    test('should handle complex case transformations', () => {
      const complexInput = 'XMLHttpRequest v2.0 (Beta)';
      
      const kebab = toKebabCase(complexInput);
      const slug = slugify(complexInput);
      const pascal = toPascalCase(kebab);
      
      expect(kebab).toBe('xml-http-request-v2-0-beta');
      expect(slug).toBe('xml-http-request-v2-0-beta');
      expect(pascal).toBe('XmlHttpRequestV20Beta');
    });
  });

  describe('Slug generation integration', () => {
    test('should create valid slugs from various case formats', () => {
      const testCases = [
        'MyComponent',
        'my-component',  
        'my_component',
        'my component',
        'Component123Test'
      ];

      for (const input of testCases) {
        const slug = slugify(input);
        expect(isValidSlug(slug)).toBe(true);
        expect(slug).toBe('my-component' + (input === 'Component123Test' ? '-123-test' : ''));
      }
    });

    test('should work with filename generation', () => {
      const userInput = 'My Awesome Component!@#';
      
      const filename = slugifyFilename(userInput);
      const kebab = toKebabCase(userInput);
      
      expect(filename).toBe('my-awesome-component');
      expect(kebab).toBe('my-awesome-component');
      expect(isValidSlug(filename)).toBe(true);
    });
  });

  describe('Round-trip conversions', () => {
    test('should maintain semantic meaning through conversions', () => {
      const originalInputs = [
        'user-authentication',
        'blog-post-title', 
        'api-endpoint-v2',
        'navigation-component'
      ];

      for (const input of originalInputs) {
        const title = unslugify(input);
        const reslugified = slugify(title);
        
        expect(reslugified).toBe(input);
        expect(isValidSlug(reslugified)).toBe(true);
      }
    });

    test('should preserve meaning in case conversions', () => {
      const testCases = [
        { kebab: 'user-profile', pascal: 'UserProfile', camel: 'userProfile' },
        { kebab: 'api-client', pascal: 'ApiClient', camel: 'apiClient' },
        { kebab: 'data-store', pascal: 'DataStore', camel: 'dataStore' }
      ];

      for (const { kebab, pascal, camel } of testCases) {
        expect(toPascalCase(kebab)).toBe(pascal);
        expect(toCamelCase(kebab)).toBe(camel);
        expect(toKebabCase(pascal)).toBe(kebab);
        expect(toKebabCase(camel)).toBe(kebab);
      }
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should handle component name transformations', () => {
      const userInput = 'User Profile Card';
      
      // Transform for different use cases
      const componentName = toPascalCase(userInput);  // React/Vue component
      const fileName = toKebabCase(userInput);        // file name
      const cssClass = toKebabCase(userInput);        // CSS class
      const slug = slugify(userInput);                // URL slug
      const title = toTitleCase(userInput);           // Display title
      
      expect(componentName).toBe('UserProfileCard');
      expect(fileName).toBe('user-profile-card');
      expect(cssClass).toBe('user-profile-card');  
      expect(slug).toBe('user-profile-card');
      expect(title).toBe('User Profile Card');
      
      // All should be valid
      expect(isValidSlug(slug)).toBe(true);
      expect(isValidSlug(fileName)).toBe(true);
      expect(isValidSlug(cssClass)).toBe(true);
    });

    test('should handle blog post transformations', () => {
      const blogTitle = '10 Tips for Better JavaScript Performance';
      
      const urlSlug = slugify(blogTitle);
      const fileName = slugifyFilename(blogTitle + '.md');
      const displayTitle = toTitleCase(blogTitle);
      
      expect(urlSlug).toBe('10-tips-for-better-javascript-performance');
      expect(fileName).toBe('10-tips-for-better-javascript-performance-md');
      expect(displayTitle).toBe('10 Tips For Better Javascript Performance');
      
      expect(isValidSlug(urlSlug)).toBe(true);
    });

    test('should handle international content', () => {
      const frenchTitle = 'Café & Résumé';
      const germanTitle = 'Björk Guðmundsdóttir';
      
      const frenchSlug = slugify(frenchTitle);
      const germanSlug = slugify(germanTitle);
      
      expect(frenchSlug).toBe('cafe-resume');
      expect(germanSlug).toBe('bjork-gusmundsdottir');
      
      expect(isValidSlug(frenchSlug)).toBe(true);
      expect(isValidSlug(germanSlug)).toBe(true);
    });

    test('should handle technical terms', () => {
      const techTerms = [
        'OAuth 2.0 Authentication',
        'REST/GraphQL API',
        'WebAssembly (WASM)',
        'TypeScript Interface'
      ];

      for (const term of techTerms) {
        const slug = slugify(term);
        const kebab = toKebabCase(term);
        const pascal = toPascalCase(term);
        
        expect(isValidSlug(slug)).toBe(true);
        expect(isValidSlug(kebab)).toBe(true);
        
        // Should produce reasonable results
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(pascal).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      }
    });
  });

  describe('Error handling and edge cases', () => {
    test('should gracefully handle empty and invalid inputs', () => {
      const problematicInputs = ['', '   ', '---', '___', '!!!', '@@@'];
      
      for (const input of problematicInputs) {
        const slug = slugify(input);
        const kebab = toKebabCase(input);
        const pascal = toPascalCase(input);
        
        // Should not throw errors
        expect(() => slugify(input)).not.toThrow();
        expect(() => toKebabCase(input)).not.toThrow();
        expect(() => toPascalCase(input)).not.toThrow();
        
        // Results should be valid (empty is acceptable)
        if (slug) {
          expect(isValidSlug(slug)).toBe(true);
        }
      }
    });

    test('should handle very long inputs appropriately', () => {
      const longInput = 'a'.repeat(200) + ' very long component name';
      
      const slug = slugify(longInput, { maxLength: 50 });
      const filename = slugifyFilename(longInput);
      
      expect(slug.length).toBeLessThanOrEqual(50);
      expect(filename.length).toBeLessThanOrEqual(200);
      expect(isValidSlug(slug)).toBe(true);
    });
  });

  describe('Performance and consistency', () => {
    test('should produce consistent results across multiple calls', () => {
      const input = 'Test Component Name 123';
      
      // Multiple calls should produce identical results
      for (let i = 0; i < 10; i++) {
        expect(toPascalCase(input)).toBe('TestComponentName123');
        expect(toKebabCase(input)).toBe('test-component-name-123');
        expect(slugify(input)).toBe('test-component-name-123');
      }
    });

    test('should handle batch transformations efficiently', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => `Component ${i}`);
      
      const startTime = Date.now();
      
      const results = inputs.map(input => ({
        pascal: toPascalCase(input),
        kebab: toKebabCase(input),
        slug: slugify(input)
      }));
      
      const endTime = Date.now();
      
      // Should complete reasonably quickly (less than 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100);
      
      // All results should be valid
      results.forEach((result, index) => {
        expect(result.pascal).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
        expect(isValidSlug(result.kebab)).toBe(true);
        expect(isValidSlug(result.slug)).toBe(true);
      });
    });
  });
});
