import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'child_process';
import { promisify } from 'util';
import {
  addProjectConfiguration,
  formatFiles,
  joinPathFragments,
  names,
  updateJson
} from '@nx/devkit';

function execAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    
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

function getTemplatesRoot(workspaceRoot) {
  // Adjust this to your monorepo; keep it centralized for easy edits.
  // Templates should be named exactly as the enum values in schema.json:
  // - astro-minimal, astro-vue, astro-preact, astro-mdx, astro-markdoc, astro-asciidoc
  return path.join(workspaceRoot, 'templates');
}

export default async function initGenerator(tree, schema) {
  const workspaceRoot = tree.root;
  const projectNames = names(schema.name);
  const projectName = projectNames.fileName;
  const projectDir = schema.directory || 'apps';
  const root = joinPathFragments(projectDir, projectName);

  const template = schema.template || 'astro-minimal';
  const templatesRoot = getTemplatesRoot(workspaceRoot);
  const templatePath = path.join(templatesRoot, template);

  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  // Copy template
  // Using tree API would require files within workspace; if templates live outside, fallback to fs copy.
  // Fallback robust copy using fs/promises for outside-of-tree paths:
  
  // Ensure parent exists
  await fs.mkdir(path.join(workspaceRoot, root), { recursive: true });

  // Simple directory copy
  async function copyDir(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // Skip node_modules and dist directories
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro') {
        continue;
      }
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  await copyDir(templatePath, path.join(workspaceRoot, root));

  // Update package.json name if exists
  const pkgPath = path.join(root, 'package.json');
  if (tree.exists(pkgPath)) {
    updateJson(tree, pkgPath, (json) => {
      json.name = projectName;
      return json;
    });
  }

  // Add Nx project with targets wired to this plugin's executors
  addProjectConfiguration(tree, projectName, {
    root,
    projectType: 'application',
    targets: {
      dev: { executor: 'astro-nx:dev' },
      build: { executor: 'astro-nx:build' },
      preview: { executor: 'astro-nx:preview' },
      check: { executor: 'astro-nx:check' }
    },
    tags: (schema.tags || '').split(',').map((s) => s.trim()).filter(Boolean)
  });

  await formatFiles(tree);

  // Install dependencies
  if (!schema.skipInstall) {
    // Default package manager: JPD if available, else pnpm. Respect --skipInstall.
    let pm = schema.packageManager;
    if (!pm) {
      // Check if jpd is available in common locations
      const jpdPaths = ['/usr/local/bin/jpd', '/usr/bin/jpd'];
      const hasJpd = jpdPaths.some(jpdPath => existsSync(jpdPath));
      pm = hasJpd ? 'jpd' : 'pnpm';
    }
    
    const cwd = path.join(workspaceRoot, root);
    await execAsync(pm, ['install'], { cwd });
  }
}
