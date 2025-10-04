import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';

interface Options { outDir?: string; config?: string }

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = context.root || process.cwd();
  const args = ['build'];
  if (options.config) args.push('--config', options.config);
  try {
    await execa('npx', ['astro', ...args], { cwd, stdio: 'inherit' });
    return { success: true };
  } catch {
    return { success: false };
  }
}