import type { ExecutorContext } from '@nx/devkit';
import { spawn } from 'child_process';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { resolveAstroBin } from '../../internal/cli/resolve-bin';
import { createLogger } from '../../internal/logging/logger';
import { createValidator } from '../../internal/validation/validator';

export interface CheckExecutorSchema {
  config?: string;
  verbose?: boolean;
  tsconfig?: string;
}

export default async function runExecutor(
  options: CheckExecutorSchema,
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
    
    // Validate file paths if provided
    const pathValidation = validator.validateFilePaths({
      config: options.config,
      tsconfig: options.tsconfig
    });
    
    // Report validation results
    const validationPassed = validator.reportValidationResults([
      projectValidation,
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
    const args: string[] = ['check'];
    
    if (options.config) {
      args.push('--config', options.config);
      logger.verbose(`Using config file: ${options.config}`);
    }
    
    if (options.verbose) {
      args.push('--verbose');
    }
    
    if (options.tsconfig) {
      args.push('--tsconfig', options.tsconfig);
      logger.verbose(`Using TypeScript config: ${options.tsconfig}`);
    }
    
    // Log the command to be executed
    logger.logCommand(astroBin, args, fullProjectRoot);
    
    // Prepare report output if verbose mode is enabled
    const reportPath = join(fullProjectRoot, '.astro-check');
    let reportOutput: string[] = [];
    
    logger.info('Running Astro type checks...');
    
    return new Promise((resolve) => {
      const stdio = options.verbose ? 'pipe' : 'inherit';
      
      const child = spawn(astroBin, args, {
        cwd: fullProjectRoot,
        stdio,
        shell: process.platform === 'win32',
      });
      
      // Capture output for report generation when verbose
      if (options.verbose && child.stdout && child.stderr) {
        child.stdout.on('data', (data) => {
          const output = data.toString();
          process.stdout.write(output);
          reportOutput.push(output);
        });
        
        child.stderr.on('data', (data) => {
          const output = data.toString();
          process.stderr.write(output);
          reportOutput.push(output);
        });
      }
      
      child.on('close', (code) => {
        // Generate report file when verbose mode is enabled
        if (options.verbose && reportOutput.length > 0) {
          try {
            const reportContent = [
              `# Astro Check Report`,
              `Generated: ${new Date().toISOString()}`,
              `Project: ${context.projectName}`,
              `Exit Code: ${code}`,
              ``,
              `## Output`,
              ``,
              reportOutput.join('')
            ].join('\n');
            
            // Ensure directory exists
            const reportDir = dirname(reportPath);
            if (!existsSync(reportDir)) {
              mkdirSync(reportDir, { recursive: true });
            }
            
            writeFileSync(reportPath, reportContent, 'utf8');
            logger.info(`📋 Check report written to: ${reportPath}`);
          } catch (error) {
            logger.warn(`Failed to write report file: ${(error as Error).message}`);
          }
        }
        
        if (code === 0) {
          logger.info('✅ Type checks passed successfully');
        } else {
          logger.error(`Type checks failed with exit code ${code}`);
        }
        
        resolve({ success: code === 0 });
      });
      
      child.on('error', (error) => {
        logger.error('Failed to run Astro type checks', error);
        resolve({ success: false });
      });
    });
  } catch (error) {
    logger.error('Unexpected error during check execution', error as Error);
    return { success: false };
  }
}
