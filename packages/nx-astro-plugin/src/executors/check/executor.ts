import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';

interface Options { config?: string; tsconfig?: string; verbose?: boolean }

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = context.root || process.cwd();
  const args = ['check'];
  if (options.config) args.push('--config', options.config);
  if (options.tsconfig) args.push('--tsconfig', options.tsconfig);
  if (options.verbose) args.push('--verbose');
  try {
    await execa('npx', ['astro', ...args], { cwd, stdio: 'inherit' });
    return { success: true };
  } catch {
    return { success: false };
  }
}