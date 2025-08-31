import { vi, describe, test, expect } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { 
  validateProjectExists, 
  validateNonEmptyString, 
  validateFileDoesNotExist,
  validateEnum 
} from './options';

describe('Options Validation', () => {
  describe('validateNonEmptyString', () => {
    test('should pass for valid string', () => {
      expect(() => validateNonEmptyString('valid', 'test')).not.toThrow();
    });

    test('should throw for empty string', () => {
      expect(() => validateNonEmptyString('', 'test')).toThrow('test cannot be empty');
    });

    test('should throw for undefined', () => {
      expect(() => validateNonEmptyString(undefined, 'test')).toThrow('test is required');
    });
  });

  describe('validateEnum', () => {
    test('should pass for valid enum value', () => {
      expect(() => validateEnum('md', ['md', 'mdx'] as const, 'extension')).not.toThrow();
    });

    test('should throw for invalid enum value', () => {
      expect(() => validateEnum('invalid' as any, ['md', 'mdx'] as const, 'extension')).toThrow('extension must be one of: md, mdx. Got: invalid');
    });

    test('should allow undefined for optional fields', () => {
      expect(() => validateEnum(undefined, ['md', 'mdx'] as const, 'extension')).not.toThrow();
    });
  });

  describe('validateFileDoesNotExist', () => {
    test('should pass when file does not exist', () => {
      const tree = createTreeWithEmptyWorkspace();
      expect(() => validateFileDoesNotExist(tree, 'non-existent.txt')).not.toThrow();
    });

    test('should throw when file exists and overwrite is false', () => {
      const tree = createTreeWithEmptyWorkspace();
      tree.write('existing.txt', 'content');
      expect(() => validateFileDoesNotExist(tree, 'existing.txt')).toThrow('File already exists at "existing.txt". Use --overwrite to replace it.');
    });

    test('should pass when file exists but overwrite is true', () => {
      const tree = createTreeWithEmptyWorkspace();
      tree.write('existing.txt', 'content');
      expect(() => validateFileDoesNotExist(tree, 'existing.txt', true)).not.toThrow();
    });
  });

  describe('validateProjectExists', () => {
    test('should throw when project name is empty', () => {
      const tree = createTreeWithEmptyWorkspace();
      expect(() => validateProjectExists(tree, '')).toThrow('Project name cannot be empty');
    });

    test('should throw when project does not exist', () => {
      const tree = createTreeWithEmptyWorkspace();
      expect(() => validateProjectExists(tree, 'non-existent')).toThrow('Project "non-existent" does not exist in the workspace');
    });
  });
});
