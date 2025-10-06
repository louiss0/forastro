import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  config?: string;
  tsconfig?: string;
  verbose?: boolean;
  allowGlobal?: boolean;
  binOverride?: string;
  args?: string[];
}

function projectCwd(context: ExecutorContext): string {
  const projectName = context.projectName;
  if (!projectName) {
    throw new Error('Project name is required but was not found in executor context');
  }
  const projRoot = context.projectsConfigurations?.projects?.[projectName]?.root;
  return projRoot ? join(context.root, projRoot) : (context.root || process.cwd());
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
  const workspaceRoot = context.root || process.cwd();

  let astroBin: string;
  try {
astroBin = options.binOverride || (await resolveAstroBinary(cwd, workspaceRoot, options.allowGlobal ?? true));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }

  const args = ['check'];
  if (options.config) args.push('--config', options.config);
  if (options.tsconfig) args.push('--tsconfig', options.tsconfig);
  if (options.verbose) args.push('--verbose');
  if (options.args) args.push(...options.args);

  try {
    await execa(astroBin, args, { cwd, stdio: 'inherit' });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }
}
