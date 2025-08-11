// CommonJS wrapper for Nx Astro plugin
const nxDevkit = require('@nx/devkit');
const path = require('path');

// Dynamic import for execa (ES module)
async function getExeca() {
  const { execa } = await import('execa');
  return execa;
}

// Simple placeholder exports - these would need to be properly implemented
// for a full working plugin, but for now we'll create minimal implementations
async function devExecutor(options, context) {
  try {
    const execa = await getExeca();
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = 'pnpm'; // Default to pnpm
    const args = ['exec', 'astro', 'dev'];
    
    const child = execa(packageManager, args, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    process.on('SIGTERM', () => child.kill('SIGTERM'));
    process.on('SIGINT', () => child.kill('SIGINT'));
    
    await child;
    return { success: true };
  } catch (error) {
    console.error('Error running dev server:', error);
    return { success: false, error: error.message };
  }
}

async function buildExecutor(options, context) {
  try {
    const execa = await getExeca();
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = 'pnpm'; // Default to pnpm
    const args = ['exec', 'astro', 'build'];
    
    const result = await execa(packageManager, args, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error building:', error);
    return { success: false, error: error.message };
  }
}

async function previewExecutor(options, context) {
  try {
    const execa = await getExeca();
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = 'pnpm'; // Default to pnpm
    const args = ['exec', 'astro', 'preview'];
    
    const child = execa(packageManager, args, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    process.on('SIGTERM', () => child.kill('SIGTERM'));
    process.on('SIGINT', () => child.kill('SIGINT'));
    
    await child;
    return { success: true };
  } catch (error) {
    console.error('Error running preview server:', error);
    return { success: false, error: error.message };
  }
}

async function checkExecutor(options, context) {
  try {
    const execa = await getExeca();
    const projectRoot = context.projectsConfigurations?.projects[context.projectName]?.root || '.';
    const packageManager = 'pnpm'; // Default to pnpm
    const args = ['exec', 'astro', 'check'];
    
    const result = await execa(packageManager, args, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error running check:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  dev: devExecutor,
  build: buildExecutor,
  preview: previewExecutor,
  check: checkExecutor
};
