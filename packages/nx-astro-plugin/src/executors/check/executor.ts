import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';

interface Options { config?: string; tsconfig?: string; verbose?: boolean }

function projectCwd(context: ExecutorContext): string {
  const projRoot = context.projectsConfigurations?.projects?.[context.projectName!]?.root;
  return projRoot ? join(context.root, projRoot) : (context.root || process.cwd());
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
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
