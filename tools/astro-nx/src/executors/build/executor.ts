import type { ExecutorContext } from '@nx/devkit';
import { spawn } from 'child_process';
import { join } from 'path';
import { resolveAstroBin } from '../../internal/cli/resolve-bin';
import { createLogger } from '../../internal/logging/logger';
import { createValidator } from '../../internal/validation/validator';

export interface BuildExecutorSchema {
  config?: string;
  outDir?: string;
  site?: string;
  base?: string;
  draft?: boolean;
  mode?: 'development' | 'production';
  sourcemap?: boolean;
  verbose?: boolean;
}

export default async function runExecutor(
  options: BuildExecutorSchema,
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
    
    // Validate URLs if provided
    const urlValidation = validator.validateUrls({
      site: options.site
    });
    
    // Validate file paths if provided
    const pathValidation = validator.validateFilePaths({
      config: options.config,
      outDir: options.outDir,
      base: options.base
    });
    
    // Report validation results
    const validationPassed = validator.reportValidationResults([
      projectValidation,
      urlValidation,
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
    const args: string[] = ['build'];
    
    // Map schema options to Astro build flags
    if (options.config) {
      args.push('--config', options.config);
    }
    
    if (options.site) {
      args.push('--site', options.site);
    }
    
    if (options.base) {
      args.push('--base', options.base);
    }
    
    if (options.verbose) {
      args.push('--verbose');
    }
    
    // Set environment variables
    const env = { ...process.env };
    
    if (options.mode) {
      env['NODE_ENV'] = options.mode;
      logger.verbose(`Set NODE_ENV to '${options.mode}'`);
    }
    
    if (options.outDir) {
      env['ASTRO_BUILD_OUTDIR'] = options.outDir;
      logger.verbose(`Set ASTRO_BUILD_OUTDIR to '${options.outDir}'`);
    }
    
    if (options.draft) {
      env['ASTRO_BUILD_DRAFT'] = 'true';
      logger.verbose('Enabled draft content inclusion');
    }
    
    if (options.sourcemap) {
      env['ASTRO_BUILD_SOURCEMAP'] = 'true';
      logger.verbose('Enabled sourcemap generation');
    }
    
    // Log the command to be executed
    logger.logCommand(astroBin, args, fullProjectRoot);
    
    logger.info('Starting Astro build...');
    
    return new Promise((resolve) => {
      const child = spawn(astroBin, args, {
        cwd: fullProjectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env,
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Build completed successfully');
          resolve({ success: true });
        } else {
          logger.error(`Build failed with exit code ${code}`);
          resolve({ success: false });
        }
      });
      
      child.on('error', (error) => {
        logger.error('Failed to start Astro build process', error);
        resolve({ success: false });
      });
    });
  } catch (error) {
    logger.error('Unexpected error during build execution', error as Error);
    return { success: false };
  }
}
