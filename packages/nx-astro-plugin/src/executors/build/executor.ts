import { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { BuildExecutorSchema } from './schema';
import { join } from 'path';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const { root, packageManager, outputPath, verbose } = options;
  
  try {
    const args = ['exec', 'astro', 'build'];
    
    if (verbose) {
      args.push('--verbose');
    }

    const projectRoot = context.projectsConfigurations?.projects[context.projectName!]?.root || root;
    const fullOutputPath = join(projectRoot, outputPath);
    
    if (verbose) {
      console.log(`Building Astro project in ${projectRoot}`);
      console.log(`Using package manager: ${packageManager}`);
      console.log(`Output directory: ${fullOutputPath}`);
      console.log(`Command: ${packageManager} ${args.join(' ')}`);
    }

    const result = await execa(packageManager, args, {
      cwd: projectRoot,
      stdio: verbose ? 'inherit' : 'pipe',
    });

    if (verbose) {
      console.log('Build completed successfully');
      console.log(`Output written to: ${fullOutputPath}`);
    }

    return { 
      success: true, 
      outputs: [fullOutputPath],
      result: result.stdout 
    };
  } catch (error) {
    console.error('Error building Astro project:', error);
    return { 
      success: false, 
      error: error.message,
      outputs: []
    };
  }
}
