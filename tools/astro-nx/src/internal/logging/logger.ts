import { logger } from '@nx/devkit';

export interface LoggerContext {
  verbose?: boolean;
  projectName?: string;
}

/**
 * Enhanced logger wrapper that provides consistent logging across all Astro Nx executors
 * Uses @nx/devkit logger for standard Nx logging patterns
 */
export class AstroLogger {
  private context: LoggerContext;

  constructor(context: LoggerContext = {}) {
    this.context = context;
  }

  /**
   * Log informational messages
   */
  info(message: string): void {
    logger.info(this.formatMessage(message));
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error): void {
    const fullMessage = this.formatMessage(message);
    
    if (error && this.context.verbose) {
      logger.error(`${fullMessage}\n${error.stack || error.message}`);
    } else {
      logger.error(fullMessage);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string): void {
    logger.warn(this.formatMessage(message));
  }

  /**
   * Log debug messages (only shown in verbose mode)
   */
  debug(message: string): void {
    if (this.context.verbose) {
      logger.debug(this.formatMessage(message));
    }
  }

  /**
   * Log verbose messages (only shown when --verbose flag is used)
   */
  verbose(message: string): void {
    if (this.context.verbose) {
      logger.info(`[VERBOSE] ${this.formatMessage(message)}`);
    }
  }

  /**
   * Log constructed CLI commands (respects --verbose flag)
   */
  logCommand(binary: string, args: string[], cwd?: string): void {
    if (this.context.verbose) {
      const command = `${binary} ${args.join(' ')}`;
      const location = cwd ? ` (in ${cwd})` : '';
      this.verbose(`Executing command: ${command}${location}`);
    }
  }

  /**
   * Log resolved paths (respects --verbose flag)
   */
  logResolvedPath(description: string, path: string): void {
    if (this.context.verbose) {
      this.verbose(`${description}: ${path}`);
    }
  }

  /**
   * Log execution context information
   */
  logContext(workspaceRoot: string, projectRoot: string, fullProjectRoot: string): void {
    if (this.context.verbose) {
      this.verbose(`Workspace root: ${workspaceRoot}`);
      this.verbose(`Project root: ${projectRoot}`);
      this.verbose(`Full project path: ${fullProjectRoot}`);
    }
  }

  private formatMessage(message: string): string {
    const prefix = this.context.projectName ? `[${this.context.projectName}] ` : '';
    return `${prefix}${message}`;
  }
}

/**
 * Create a logger instance with context
 */
export function createLogger(context: LoggerContext): AstroLogger {
  return new AstroLogger(context);
}
