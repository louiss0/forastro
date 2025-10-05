import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  outDir?: string;
  config?: string;
  allowGlobal?: boolean;
  binOverride?: string;
  args?: string[];
}

function projectCwd(context: ExecutorContext): string {
  const projRoot = context.projectsConfigurations?.projects?.[context.projectName!]?.root;
  return projRoot ? join(context.root, projRoot) : (context.root || process.cwd());
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
  const workspaceRoot = context.root || process.cwd();

  let astroBin: string;
  try {
    astroBin = options.binOverride || (await resolveAstroBinary(cwd, workspaceRoot, options.allowGlobal ?? true));
  } catch (err: any) {
    console.error(err.message);
    return { success: false };
  }

  const args = ['build'];
  if (options.config) args.push('--config', options.config);
  if (options.args) args.push(...options.args);

  try {
    await execa(astroBin, args, { cwd, stdio: 'inherit' });
    return { success: true };
  } catch {
    return { success: false };
  }
}
