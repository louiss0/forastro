import { execa } from 'execa';
import { logger } from '@nx/devkit';
import { resolveAstroBin } from './resolve-bin';

export interface RunAstroOptions {
  cwd?: string;
  env?: Record<string, string>;
  stdio?: 'inherit' | 'pipe';
}

export interface RunAstroResult {
  success: boolean;
  error?: string;
}

/**
 * Runs Astro command using execa for PM-agnostic execution
 * @param subcommand - The Astro subcommand to run (e.g., 'dev', 'build')
 * @param args - Additional arguments for the command
 * @param options - Execution options
 * @returns Promise with success boolean and error output
 */
export async function runAstro(
  subcommand: string,
  args: string[] = [],
  options: RunAstroOptions = {}
): Promise<RunAstroResult> {
  const { cwd = process.cwd(), env = {}, stdio = 'inherit' } = options;
  
  // Determine workspace root and project root
  // For simplicity, we'll use cwd as both if not explicitly provided
  const workspaceRoot = process.cwd();
  const projectRoot = cwd;
  
  // Resolve bin via resolveAstroBin
  const bin = resolveAstroBin(workspaceRoot, projectRoot);
  
  // Prepare the command arguments
  const commandArgs = [subcommand, ...args];
  
  // Provide detailed logs via @nx/devkit logger when --verbose
  if (args.includes('--verbose')) {
    logger.info(`Executing Astro command: ${bin} ${commandArgs.join(' ')}`);
    logger.info(`Working directory: ${cwd}`);
    logger.info(`Environment variables: ${JSON.stringify(env)}`);
  }
  
  try {
    await execa(bin, commandArgs, {
      cwd,
      env: { ...process.env, ...env },
      stdio,
    });
    
    if (args.includes('--verbose')) {
      logger.info('Astro command completed successfully');
    }
    
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string; exitCode?: number; stderr?: string };
    const errorMessage = err.message || 'Unknown error occurred';
    
    if (args.includes('--verbose')) {
      logger.error(`Astro command failed: ${errorMessage}`);
      if (err.exitCode !== undefined) {
        logger.error(`Exit code: ${err.exitCode}`);
      }
      if (err.stderr) {
        logger.error(`Error output: ${err.stderr}`);
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
