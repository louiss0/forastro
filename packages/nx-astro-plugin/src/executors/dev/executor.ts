import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';

interface Options {
  port?: number; host?: string; root?: string; open?: boolean; config?: string;
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = context.root || process.cwd();
  const args = ['dev'];
  if (options.port) args.push('--port', String(options.port));
  if (options.host) args.push('--host', options.host);
  if (options.open) args.push('--open');
  if (options.config) args.push('--config', options.config);

  try {
    await execa('npx', ['astro', ...args], { cwd, stdio: 'inherit' });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}