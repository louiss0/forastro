import { ExecutorContext } from '@nx/devkit';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { createLogger } from '../../src/internal/logging/logger';
import { createValidator } from '../../src/internal/validation/validator';
import { resolveAstroBin } from '../../src/internal/cli/resolve-bin';

export interface DevExecutorSchema {
  host?: string;
  port?: number;
  open?: boolean;
  config?: string;
  root?: string;
  verbose?: boolean;
  inspect?: boolean;
  envFile?: string;
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
      config: options.config,
      envFile: options.envFile
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
    const projectName = context.projectName || '';
    const baseProjectRoot = context.projectsConfigurations?.projects[projectName]?.root || projectName;
    const workspaceRoot = context.root;
    const projectRoot = options.root || join(workspaceRoot, baseProjectRoot);
    const fullProjectRoot = resolve(projectRoot);
    
    // Log execution context
    logger.logContext(workspaceRoot, baseProjectRoot, fullProjectRoot);
    
    // Load environment file if specified
    if (options.envFile) {
      const envPath = resolve(fullProjectRoot, options.envFile);
      logger.verbose(`Loading environment file: ${envPath}`);
      try {
        dotenv.config({ path: envPath });
        logger.verbose('Environment file loaded successfully');
      } catch (error) {
        logger.warn(`Failed to load environment file ${envPath}: ${(error as Error).message}`);
      }
    }

    // Resolve the Astro binary
    const astroBin = resolveAstroBin(workspaceRoot, fullProjectRoot);
    logger.logResolvedPath('Astro binary', astroBin);
    
    // Build command arguments
    const args: string[] = ['dev'];
    
    if (options.host) {
      args.push('--host', options.host);
      logger.verbose(`Using host ${options.host}`);
    }
    
    if (options.port) {
      args.push('--port', options.port.toString());
      logger.verbose(`Using port ${options.port}`);
    }
    
    if (options.open) {
      args.push('--open');
      logger.verbose('Will open browser after server starts');
    }
    
    if (options.config) {
      args.push('--config', options.config);
      logger.verbose(`Using config file: ${options.config}`);
    }
    
    if (options.root && options.root !== 'projectRoot') {
      args.push('--root', options.root);
      logger.verbose(`Using custom root: ${options.root}`);
    }
    
    if (options.verbose) {
      args.push('--verbose');
    }
    
    if (options.inspect) {
      args.push('--inspect');
      logger.verbose('Enabled Node.js inspector');
    }

    // Log the command to be executed
    logger.logCommand(astroBin, args, fullProjectRoot);
    
    logger.info('Starting Astro development server...');

    return new Promise((resolve) => {
      const child = spawn(astroBin, args, {
        cwd: fullProjectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32'
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

export const devExecutorSchema = {
  cacheable: false,
  outputs: []
};
