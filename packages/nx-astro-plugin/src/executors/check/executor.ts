import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { CheckExecutorSchema } from './schema';

export default async function runExecutor(
  options: CheckExecutorSchema,
  context: ExecutorContext
) {
  const { root, packageManager, watch, verbose } = options;
  
  try {
    const args = ['exec', 'astro', 'check'];
    
    if (watch) {
      args.push('--watch');
    }

    if (verbose) {
      args.push('--verbose');
    }

    const projectRoot = context.projectsConfigurations?.projects[context.projectName!]?.root || root;

    if (verbose) {
      console.log(`Running Astro check in ${projectRoot}`);
      console.log(`Using package manager: ${packageManager}`);
      console.log(`Command: ${packageManager} ${args.join(' ')}`);
    }

    const result = await execa(packageManager, args, {
      cwd: projectRoot,
      stdio: verbose ? 'inherit' : 'pipe'
    });


    console.log('Astro check passed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error running Astro check:', error);
    return { success: false, error: error.message };
  }
}
