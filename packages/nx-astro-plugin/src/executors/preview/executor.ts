import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';

interface Options { port?: number; host?: string; outDir?: string }

function projectCwd(context: ExecutorContext): string {
  const projRoot = context.projectsConfigurations?.projects?.[context.projectName!]?.root;
  return projRoot ? join(context.root, projRoot) : (context.root || process.cwd());
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
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
