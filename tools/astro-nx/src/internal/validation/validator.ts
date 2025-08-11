import type { ExecutorContext } from '@nx/devkit';
import { AstroLogger } from '../logging/logger';

export interface ValidationResult {
  success: boolean;
  errors: string[];
  hints: string[];
}

export interface ValidationContext {
  projectName?: string;
  verbose?: boolean;
}

/**
 * Validation utilities for Astro Nx executors
 * Provides clear error messages and hints per Rule 3.4
 */
export class AstroValidator {
  private logger: AstroLogger;
  private context: ValidationContext;

  constructor(context: ValidationContext, logger: AstroLogger) {
    this.context = context;
    this.logger = logger;
  }

  /**
   * Validate that a project exists and has a valid root
   */
  validateProject(context: ExecutorContext): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: []
    };

    if (!context.projectName) {
      result.success = false;
      result.errors.push('Project name is required');
      result.hints.push('Ensure you are running this command from within an Nx workspace');
      result.hints.push('Try running: nx <command> <project-name>');
      return result;
    }

    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root;
    
    if (!projectRoot) {
      result.success = false;
      result.errors.push(`Could not find project root for '${context.projectName}'`);
      result.hints.push(`Check if '${context.projectName}' exists in your workspace`);
      result.hints.push('Try running: nx show projects');
      result.hints.push('Verify project.json exists in the project directory');
    }

    return result;
  }

  /**
   * Validate required string arguments
   */
  validateRequiredStrings(required: Record<string, string | undefined>): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: []
    };

    const missing = Object.entries(required)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      result.success = false;
      result.errors.push(`Required arguments are missing: ${missing.join(', ')}`);
      
      missing.forEach(arg => {
        result.hints.push(`Provide --${arg} <value>`);
      });

      result.hints.push('Use --help to see all available options');
    }

    return result;
  }

  /**
   * Validate file paths exist and are readable
   */
  validateFilePaths(paths: Record<string, string | undefined>): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: []
    };

    // For now, we'll just validate they are provided and not empty
    // File existence validation could be added later if needed
    const invalid = Object.entries(paths)
      .filter(([_, path]) => path && (typeof path !== 'string' || path.trim() === ''))
      .map(([key]) => key);

    if (invalid.length > 0) {
      result.success = false;
      result.errors.push(`Invalid file paths provided for: ${invalid.join(', ')}`);
      
      invalid.forEach(arg => {
        result.hints.push(`Ensure --${arg} points to a valid file path`);
      });
    }

    return result;
  }

  /**
   * Validate port numbers are in valid range
   */
  validatePortNumbers(ports: Record<string, number | undefined>): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: []
    };

    const invalid = Object.entries(ports)
      .filter(([_, port]) => port !== undefined && (port < 1 || port > 65535))
      .map(([key, port]) => ({ key, port }));

    if (invalid.length > 0) {
      result.success = false;
      result.errors.push(`Invalid port numbers: ${invalid.map(({ key, port }) => `${key}=${port}`).join(', ')}`);
      
      invalid.forEach(({ key }) => {
        result.hints.push(`Port for --${key} must be between 1 and 65535`);
      });
      
      result.hints.push('Common development ports: 3000, 4000, 4321, 8080');
    }

    return result;
  }

  /**
   * Validate URLs have proper format
   */
  validateUrls(urls: Record<string, string | undefined>): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: []
    };

    const invalid = Object.entries(urls)
      .filter(([_, url]) => {
        if (!url) return false;
        try {
          new URL(url);
          return false;
        } catch {
          return true;
        }
      })
      .map(([key]) => key);

    if (invalid.length > 0) {
      result.success = false;
      result.errors.push(`Invalid URLs provided for: ${invalid.join(', ')}`);
      
      invalid.forEach(arg => {
        result.hints.push(`Ensure --${arg} is a valid URL (e.g., https://example.com)`);
      });
    }

    return result;
  }

  /**
   * Report validation results and log appropriate messages
   */
  reportValidationResults(results: ValidationResult[]): boolean {
    const failures = results.filter(r => !r.success);
    
    if (failures.length === 0) {
      return true;
    }

    // Collect all errors and hints
    const allErrors: string[] = [];
    const allHints: string[] = [];
    
    failures.forEach(result => {
      allErrors.push(...result.errors);
      allHints.push(...result.hints);
    });

    // Log errors
    allErrors.forEach(error => {
      this.logger.error(error);
    });

    // Log hints
    if (allHints.length > 0) {
      this.logger.info('');
      this.logger.info('💡 Suggestions:');
      allHints.forEach(hint => {
        this.logger.info(`   ${hint}`);
      });
    }

    // Additional verbose information
    if (this.context.verbose) {
      this.logger.verbose('Validation failed with detailed context');
      this.logger.verbose(`Project: ${this.context.projectName || 'unknown'}`);
      this.logger.verbose(`Total validation failures: ${failures.length}`);
    }

    return false;
  }
}

/**
 * Create a validator instance
 */
export function createValidator(context: ValidationContext, logger: AstroLogger): AstroValidator {
  return new AstroValidator(context, logger);
}
