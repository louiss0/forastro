import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import generator from './generator';
import { InitGeneratorSchema } from './schema';

describe('init generator', () => {
  let tree: Tree;
  const options: InitGeneratorSchema = { name: 'test-project' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should create project files', async () => {
    await generator(tree, options);

    expect(tree.exists('test-project/astro.config.mjs')).toBe(true);
    expect(tree.exists('test-project/src/pages/index.astro')).toBe(true);
    expect(tree.exists('test-project/public/favicon.svg')).toBe(true);
  });

  it('should add project configuration', async () => {
    await generator(tree, options);

    const config = tree.read('workspace.json') || tree.read('project.json');
    expect(config).toBeDefined();
  });

  it('should update package.json with dependencies', async () => {
    await generator(tree, options);

    const packageJson = JSON.parse(tree.read('package.json', 'utf-8'));
    expect(packageJson.dependencies?.astro || packageJson.devDependencies?.astro).toBeDefined();
    expect(packageJson.devDependencies?.['@types/node']).toBeDefined();
    expect(packageJson.devDependencies?.vite).toBeDefined();
    expect(packageJson.devDependencies?.eslint).toBeDefined();
  });

  it('should handle custom directory', async () => {
    const customOptions = { ...options, directory: 'apps' };
    await generator(tree, customOptions);

    expect(tree.exists('apps/test-project/astro.config.mjs')).toBe(true);
    expect(tree.exists('apps/test-project/src/pages/index.astro')).toBe(true);
  });

  it('should handle custom package manager', async () => {
    const customOptions = { ...options, packageManager: 'pnpm' as const };
    await generator(tree, customOptions);

    const packageJson = JSON.parse(tree.read('package.json', 'utf-8'));
    // Dependencies should still be added regardless of package manager
    expect(packageJson.dependencies?.astro || packageJson.devDependencies?.astro).toBeDefined();
  });

  it('should handle tags', async () => {
    const customOptions = { ...options, tags: 'frontend,astro' };
    await generator(tree, customOptions);

    // Check if project.json exists (standalone project configuration)
    const projectJsonExists = tree.exists('test-project/project.json');
    if (projectJsonExists) {
      const projectJson = JSON.parse(tree.read('test-project/project.json', 'utf-8'));
      expect(projectJson.tags).toContain('frontend');
      expect(projectJson.tags).toContain('astro');
    } else {
      // Check nx.json for project configuration
      const nxJson = JSON.parse(tree.read('nx.json', 'utf-8'));
      const projects = nxJson.projects || {};
      const projectConfig = projects['test-project'];
      
      // Tags should be in the project configuration
      expect(projectConfig?.tags).toContain('frontend');
      expect(projectConfig?.tags).toContain('astro');
    }
  });

  it('should update nx.json with target defaults', async () => {
    await generator(tree, options);

    const nxJson = JSON.parse(tree.read('nx.json', 'utf-8'));
    expect(nxJson.targetDefaults).toBeDefined();
    expect(nxJson.targetDefaults.dev).toBeDefined();
    expect(nxJson.targetDefaults.build).toBeDefined();
    expect(nxJson.targetDefaults.preview).toBeDefined();
  });

  it('should create index.astro with correct content', async () => {
    await generator(tree, options);

    const indexContent = tree.read('test-project/src/pages/index.astro', 'utf-8');
    expect(indexContent).toContain('const title = \'test-project\';');
    expect(indexContent).toContain('Welcome to {title}');
    expect(indexContent).toContain('This is your new Astro project created with Nx!');
  });

  it('should create astro.config.mjs with correct content', async () => {
    await generator(tree, options);

    const configContent = tree.read('test-project/astro.config.mjs', 'utf-8');
    expect(configContent).toContain('import { defineConfig } from \'astro/config\'');
    expect(configContent).toContain('export default defineConfig');
  });

  it('should handle skip format option', async () => {
    const customOptions = { ...options, skipFormat: true };
    
    // This should not throw an error
    await generator(tree, customOptions);
    
    expect(tree.exists('test-project/astro.config.mjs')).toBe(true);
  });
});
