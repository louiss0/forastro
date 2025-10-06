import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  names: string[];
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
  return projRoot ? join(context.root || process.cwd(), projRoot) : (context.root || process.cwd());
}

export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
  const workspaceRoot = context.root || process.cwd();

  if (!options.names || options.names.length === 0) {
    console.error('No integration names provided. Use --names=<name1,name2,...>');
    return { success: false };
  }

  let astroBin: string;
  try {
    astroBin = options.binOverride || (await resolveAstroBinary(cwd, workspaceRoot, options.allowGlobal ?? false));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }

  try {
    for (const name of options.names) {
      const sanitized = String(name).trim();
      if (!sanitized) continue;
      const args = ['add', sanitized, '--yes'];
      if (options.args) args.push(...options.args);
      await execa(astroBin, args, { cwd, stdio: 'inherit' });
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }
}