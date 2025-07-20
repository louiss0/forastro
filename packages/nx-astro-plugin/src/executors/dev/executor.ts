import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { DevExecutorSchema } from './schema';

export default async function runExecutor(
  options: DevExecutorSchema,
  context: ExecutorContext
) {
  const { root, packageManager, port, host, open, verbose } = options;
  
  try {
    const args = ['exec', 'astro', 'dev'];
    
    // Add optional flags
    if (port !== 4321) {
      args.push('--port', port.toString());
    }
    
    if (host !== 'localhost') {
      args.push('--host', host);
    }
    
    if (open) {
      args.push('--open');
    }
    
    if (verbose) {
      args.push('--verbose');
    }

    const projectRoot = context.projectsConfigurations?.projects[context.projectName!]?.root || root;
    
    if (verbose) {
      console.log(`Starting Astro dev server in ${projectRoot}`);
      console.log(`Using package manager: ${packageManager}`);
      console.log(`Command: ${packageManager} ${args.join(' ')}`);
    }

    const child = execa(packageManager, args, {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });

    await child;
    
    return { success: true };
  } catch (error) {
    console.error('Error running Astro dev server:', error);
    return { success: false, error: error.message };
  }
}
