import type { ExecutorContext } from '@nx/devkit';
import { spawn } from 'child_process';
import { join } from 'path';
import { resolveAstroBin } from '../../internal/cli/resolve-bin';
import { createLogger } from '../../internal/logging/logger';
import { createValidator } from '../../internal/validation/validator';

export interface DevExecutorSchema {
  port?: number;
  host?: string;
  open?: boolean;
  config?: string;
  verbose?: boolean;
}

export default async function runExecutor(
  options: DevExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const logger = createLogger({
    verbose: options.verbose,
    projectName: context.projectName
  });
  
  const validator = createValidator({
    verbose: options.verbose,
    projectName: context.projectName
  }, logger);

  try {
    // Validate project context
    const projectValidation = validator.validateProject(context);
    
    // Validate port numbers if provided
    const portValidation = validator.validatePortNumbers({
      port: options.port
    });
    
    // Validate file paths if provided
    const pathValidation = validator.validateFilePaths({
      config: options.config
    });
    
    // Report validation results
    const validationPassed = validator.reportValidationResults([
      projectValidation,
      portValidation,
      pathValidation
    ]);
    
    if (!validationPassed) {
      return { success: false };
    }

    // Get project details
    const projectRoot = context.projectsConfigurations?.projects[context.projectName!]?.root 
      || context.projectName!;
    const workspaceRoot = context.root;
    const fullProjectRoot = join(workspaceRoot, projectRoot);
    
    // Log execution context
    logger.logContext(workspaceRoot, projectRoot, fullProjectRoot);
    
    // Resolve the Astro binary
    const astroBin = resolveAstroBin(workspaceRoot, fullProjectRoot);
    logger.logResolvedPath('Astro binary', astroBin);
    
    // Build command arguments
    const args: string[] = ['dev'];
    
    if (options.port) {
      args.push('--port', options.port.toString());
      logger.verbose(`Using port ${options.port}`);
    }
    
    if (options.host) {
      args.push('--host', options.host);
      logger.verbose(`Using host ${options.host}`);
    }
    
    if (options.open) {
      args.push('--open');
      logger.verbose('Will open browser after server starts');
    }
    
    if (options.config) {
      args.push('--config', options.config);
      logger.verbose(`Using config file: ${options.config}`);
    }
    
    if (options.verbose) {
      args.push('--verbose');
    }
    
    // Log the command to be executed
    logger.logCommand(astroBin, args, fullProjectRoot);
    
    logger.info('Starting Astro development server...');
    
    return new Promise((resolve) => {
      const child = spawn(astroBin, args, {
        cwd: fullProjectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Development server stopped cleanly');
          resolve({ success: true });
        } else {
          logger.error(`Development server exited with code ${code}`);
          resolve({ success: false });
        }
      });
      
      child.on('error', (error) => {
        logger.error('Failed to start Astro development server', error);
        resolve({ success: false });
      });
      
      // Handle Ctrl+C gracefully
      const gracefulShutdown = (signal: string) => {
        logger.verbose(`Received ${signal}, shutting down development server...`);
        child.kill(signal as NodeJS.Signals);
      };
      
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    });
  } catch (error) {
    logger.error('Unexpected error during dev server execution', error as Error);
    return { success: false };
  }
}
