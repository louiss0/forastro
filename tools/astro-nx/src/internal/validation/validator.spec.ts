import { existsSync } from 'fs';
import type { ExecutorContext } from '@nx/devkit';
import { AstroValidator } from './validator';
import { createLogger } from '../logging/logger';
import { vi } from 'vitest';

// Mock fs module
vi.mock('fs');

const mockedExistsSync = vi.mocked(existsSync);

describe('AstroValidator', () => {
  let validator: AstroValidator;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({ verbose: false, projectName: 'test-project' });
    validator = new AstroValidator(
      { verbose: false, projectName: 'test-project' },
      logger
    );
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('validateProject', () => {
    it('should fail when project name is missing', () => {
      const context: ExecutorContext = {
        root: '/workspace',
        cwd: '/workspace',
        isVerbose: false,
        projectName: undefined,
        projectsConfigurations: undefined
      };

      const result = validator.validateProject(context);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Project name is required');
      expect(result.hints.length).toBeGreaterThan(0);
    });

    it('should gracefully handle missing project in projectsConfigurations', () => {
      const context: ExecutorContext = {
        root: '/workspace',
        cwd: '/workspace',
        isVerbose: false,
        projectName: 'my-app',
        projectsConfigurations: {
          version: 2,
          projects: {}
        }
      };

      const result = validator.validateProject(context);

      expect(result.success).toBe(true); // Should not fail, graceful fallback
      expect(result.errors.length).toBe(0);
    });

    it('should succeed when project exists in projectsConfigurations', () => {
      const context: ExecutorContext = {
        root: '/workspace',
        cwd: '/workspace',
        isVerbose: false,
        projectName: 'my-app',
        projectsConfigurations: {
          version: 2,
          projects: {
            'my-app': {
              root: 'apps/my-app'
            }
          }
        }
      };

      const result = validator.validateProject(context);

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('validatePortNumbers', () => {
    it('should reject negative ports', () => {
      const result = validator.validatePortNumbers({
        port: -1
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Invalid port numbers');
      expect(result.hints.some(hint => hint.includes('positive number'))).toBe(true);
    });

    it('should reject zero port', () => {
      const result = validator.validatePortNumbers({
        port: 0
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Invalid port numbers');
      expect(result.hints.some(hint => hint.includes('positive number'))).toBe(true);
    });

    it('should reject ports above 65535', () => {
      const result = validator.validatePortNumbers({
        port: 65536
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Invalid port numbers');
      expect(result.hints.some(hint => hint.includes('between 1 and 65535'))).toBe(true);
    });

    it('should accept valid ports in range [1..65535]', () => {
      const result = validator.validatePortNumbers({
        port: 3000,
        altPort: 65535,
        anotherPort: 1
      });

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should skip undefined ports', () => {
      const result = validator.validatePortNumbers({
        port: undefined,
        definedPort: 4321
      });

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('validateFilePaths', () => {
    it('should fail when provided file paths do not exist', () => {
      // Temporarily disable test environment bypass for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      mockedExistsSync.mockReturnValue(false);
      
      const result = validator.validateFilePaths({
        config: 'nonexistent.config.mjs'
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('File paths do not exist');
      expect(result.hints.some(hint => hint.includes('nonexistent.config.mjs'))).toBe(true);
      expect(mockedExistsSync).toHaveBeenCalledWith('nonexistent.config.mjs');
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should pass when provided file paths exist', () => {
      // Temporarily disable test environment bypass for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      mockedExistsSync.mockReturnValue(true);
      
      const result = validator.validateFilePaths({
        config: 'astro.config.mjs'
      });

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(mockedExistsSync).toHaveBeenCalledWith('astro.config.mjs');
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should skip undefined file paths', () => {
      // Temporarily disable test environment bypass for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Since we're skipping undefined, we won't call existsSync for config
      // but we will for outDir, so let's mock it
      mockedExistsSync.mockReturnValue(true);

      const validationResult = validator.validateFilePaths({
        config: undefined,
        outDir: 'dist'
      });

      expect(validationResult.success).toBe(true);
      expect(mockedExistsSync).toHaveBeenCalledWith('dist');
      expect(mockedExistsSync).not.toHaveBeenCalledWith(undefined);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle invalid file path strings', () => {
      const result = validator.validateFilePaths({
        config: '' // Empty string
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Invalid file paths provided for');
      expect(result.hints.some(hint => hint.includes('valid file path string'))).toBe(true);
    });

    it('should handle mixed valid and invalid paths', () => {
      // Temporarily disable test environment bypass for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      mockedExistsSync.mockImplementation((path) => {
        return path === 'existing.config.mjs';
      });
      
      const result = validator.validateFilePaths({
        config: 'existing.config.mjs',
        nonExistent: 'missing.file.mjs'
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('File paths do not exist'))).toBe(true);
      expect(mockedExistsSync).toHaveBeenCalledWith('existing.config.mjs');
      expect(mockedExistsSync).toHaveBeenCalledWith('missing.file.mjs');
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('reportValidationResults', () => {
    it('should return true when all validations pass', () => {
      const results = [
        { success: true, errors: [], hints: [] },
        { success: true, errors: [], hints: [] }
      ];

      const result = validator.reportValidationResults(results);

      expect(result).toBe(true);
    });

    it('should return false when any validation fails', () => {
      // Mock logger methods
      const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => void 0);
      const loggerInfoSpy = vi.spyOn(logger, 'info').mockImplementation(() => void 0);

      const results = [
        { success: true, errors: [], hints: [] },
        { success: false, errors: ['Test error'], hints: ['Test hint'] }
      ];

      const result = validator.reportValidationResults(results);

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith('Test error');
      expect(loggerInfoSpy).toHaveBeenCalledWith('💡 Suggestions:');
      expect(loggerInfoSpy).toHaveBeenCalledWith('   Test hint');
    });
  });
});
