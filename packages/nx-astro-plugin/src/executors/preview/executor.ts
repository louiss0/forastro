import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';

interface Options { port?: number; host?: string; outDir?: string }

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = context.root || process.cwd();
  const args = ['preview'];
  if (options.port) args.push('--port', String(options.port));
  if (options.host) args.push('--host', options.host);
  try {
    await execa('npx', ['astro', ...args], { cwd, stdio: 'inherit' });
    return { success: true };
  } catch {
    return { success: false };
  }
}