import { spawn } from 'child_process';
import { promisify } from 'util';

function execAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    
    process.on('SIGTERM', () => child.kill('SIGTERM'));
    process.on('SIGINT', () => child.kill('SIGINT'));
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

export async function dev(options, context) {
  try {
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = process.env.PM || 'pnpm';
    await execAsync(packageManager, ['exec', 'astro', 'dev'], { cwd: projectRoot });
    return { success: true };
  } catch (error) {
    console.error('Error running dev server:', error);
    return { success: false, error: error.message };
  }
}

export async function build(options, context) {
  try {
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = process.env.PM || 'pnpm';
    await execAsync(packageManager, ['exec', 'astro', 'build'], { cwd: projectRoot });
    return { success: true };
  } catch (error) {
    console.error('Error building:', error);
    return { success: false, error: error.message };
  }
}

export async function preview(options, context) {
  try {
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = process.env.PM || 'pnpm';
    await execAsync(packageManager, ['exec', 'astro', 'preview'], { cwd: projectRoot });
    return { success: true };
  } catch (error) {
    console.error('Error running preview server:', error);
    return { success: false, error: error.message };
  }
}

export async function check(options, context) {
  try {
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = process.env.PM || 'pnpm';
    await execAsync(packageManager, ['exec', 'astro', 'check'], { cwd: projectRoot });
    return { success: true };
  } catch (error) {
    console.error('Error running check:', error);
    return { success: false, error: error.message };
  }
}
