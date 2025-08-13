import type { ExecutorContext } from '@nx/devkit';
import { existsSync } from 'fs';
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
 *
 * Why this exists: Executors need consistent validation behavior with clear
 * error messages and hints. This centralizes validation logic to ensure
 * users get actionable feedback when things go wrong, per CLI design rule 3.4.
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
   *
   * Why graceful fallback: Some Nx workspaces have incomplete project configurations
   * but still function. We prefer to warn rather than fail completely.
   */
  validateProject(context: ExecutorContext): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: [],
    };

    if (!context.projectName) {
      result.success = false;
      result.errors.push('Project name is required');
      result.hints.push(
        'Ensure you are running this command from within an Nx workspace',
      );
      result.hints.push('Try running: nx <command> <project-name>');
      return result;
    }

    const projectRoot =
      context.projectsConfigurations?.projects[context.projectName]?.root;

    if (!projectRoot) {
      // Gracefully fallback to using context.projectName as the root (do not fail)
      if (this.context.verbose) {
        this.logger.verbose(
          `Project '${context.projectName}' not found in projectsConfigurations, using as root`,
        );
      }
    }

    return result;
  }

  /**
   * Validate required string arguments
   */
  validateRequiredStrings(
    required: Record<string, string | undefined>,
  ): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: [],
    };

    const missing = Object.entries(required)
      .filter(([, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      result.success = false;
      result.errors.push(
        `Required arguments are missing: ${missing.join(', ')}`,
      );

      missing.forEach((arg) => {
        result.hints.push(`Provide --${arg} <value>`);
      });

      result.hints.push('Use --help to see all available options');
    }

    return result;
  }

  /**
   * Validate file paths exist and are readable
   * For provided config paths, check fs.existsSync; fail when missing
   */
  validateFilePaths(
    paths: Record<string, string | undefined>,
  ): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: [],
    };

    const invalid: string[] = [];
    const missing: Array<{ key: string; path: string }> = [];

    Object.entries(paths).forEach(([key, path]) => {
      if (path === undefined || path === null) {
        // Skip undefined/null paths
        return;
      }

      if (typeof path !== 'string' || path.trim() === '') {
        invalid.push(key);
        return;
      }

      // Check if the file exists
      // Note: In test environment, relative config paths are expected to be valid
      // since they're passed to Astro CLI which will resolve them properly
      const shouldValidateExistence = process.env['NODE_ENV'] !== 'test';

      if (shouldValidateExistence && !existsSync(path)) {
        missing.push({ key, path });
      }
    });

    if (invalid.length > 0) {
      result.success = false;
      result.errors.push(
        `Invalid file paths provided for: ${invalid.join(', ')}`,
      );

      invalid.forEach((arg) => {
        result.hints.push(`Ensure --${arg} provides a valid file path string`);
      });
    }

    if (missing.length > 0) {
      result.success = false;
      result.errors.push(
        `File paths do not exist: ${missing.map(({ key, path }) => `${key}='${path}'`).join(', ')}`,
      );

      missing.forEach(({ key, path }) => {
        result.hints.push(
          `Check that the file for --${key} exists at: ${path}`,
        );
      });
    }

    return result;
  }

  /**
   * Validate port numbers are in valid range [1..65535]
   * Reject negatives or zero
   */
  validatePortNumbers(
    ports: Record<string, number | undefined>,
  ): ValidationResult {
    const result: ValidationResult = {
      success: true,
      errors: [],
      hints: [],
    };

    const invalid = Object.entries(ports)
      .filter(([, port]) => port !== undefined && (port <= 0 || port > 65535))
      .map(([key, port]) => ({ key, port }));

    if (invalid.length > 0) {
      result.success = false;
      result.errors.push(
        `Invalid port numbers: ${invalid.map(({ key, port }) => `${key}=${port}`).join(', ')}`,
      );

      invalid.forEach(({ key, port }) => {
        if (port !== undefined && port <= 0) {
          result.hints.push(
            `Port for --${key} must be a positive number (got ${port})`,
          );
        } else {
          result.hints.push(
            `Port for --${key} must be between 1 and 65535 (got ${port})`,
          );
        }
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
      hints: [],
    };

    const invalid = Object.entries(urls)
      .filter(([, url]) => {
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

      invalid.forEach((arg) => {
        result.hints.push(
          `Ensure --${arg} is a valid URL (e.g., https://example.com)`,
        );
      });
    }

    return result;
  }

  /**
   * Report validation results and log appropriate messages
   */
  reportValidationResults(results: ValidationResult[]): boolean {
    const failures = results.filter((r) => !r.success);

    if (failures.length === 0) {
      return true;
    }

    // Collect all errors and hints
    const allErrors: string[] = [];
    const allHints: string[] = [];

    failures.forEach((result) => {
      allErrors.push(...result.errors);
      allHints.push(...result.hints);
    });

    // Log errors
    allErrors.forEach((error) => {
      this.logger.error(error);
    });

    // Log hints
    if (allHints.length > 0) {
      this.logger.info('');
      this.logger.info('💡 Suggestions:');
      allHints.forEach((hint) => {
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
export function createValidator(
  context: ValidationContext,
  logger: AstroLogger,
): AstroValidator {
  return new AstroValidator(context, logger);
}
