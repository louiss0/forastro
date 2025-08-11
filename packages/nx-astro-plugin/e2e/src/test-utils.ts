import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mkdtemp, rm, access, readFile, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import initGenerator from '../../src/generators/init/impl.js';

export interface TestWorkspace {
  workspaceRoot: string;
  tree: Tree;
  cleanup: () => Promise<void>;
}

export interface GeneratorOptions {
  name: string;
  template?: string;
  directory?: string;
  tags?: string;
  skipInstall?: boolean;
  packageManager?: 'jpd' | 'pnpm';
}

/**
 * Creates a temporary workspace for testing
 */
export async function createTestWorkspace(): Promise<TestWorkspace> {
  const tempDir = await mkdtemp(join(tmpdir(), 'nx-astro-test-'));
  const tree = createTreeWithEmptyWorkspace();
  
  // Mock workspace root to point to our temp directory
  Object.defineProperty(tree, 'root', {
    value: tempDir,
    writable: false,
  });

  // Copy templates directory to temp workspace so generator can find them
  await setupTemplatesInWorkspace(tempDir);

  const cleanup = async () => {
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true });
    }
  };

  return {
    workspaceRoot: tempDir,
    tree,
    cleanup,
  };
}

/**
 * Copy templates directory to the test workspace
 */
export async function setupTemplatesInWorkspace(workspaceRoot: string) {
  // Path to the real templates directory in the monorepo
  const realTemplatesPath = resolve(__dirname, '../../../../templates');
  const testTemplatesPath = join(workspaceRoot, 'templates');
  
  if (existsSync(realTemplatesPath)) {
    await mkdir(testTemplatesPath, { recursive: true });
    await cp(realTemplatesPath, testTemplatesPath, { recursive: true });
  } else {
    throw new Error(`Templates directory not found at: ${realTemplatesPath}`);
  }
}

/**
 * Runs the init generator with given options
 */
export async function runInitGenerator(tree: Tree, options: GeneratorOptions) {
  return initGenerator(tree, options);
}

/**
 * Asserts that the project configuration was added correctly
 */
export function assertProjectConfiguration(tree: Tree, projectName: string) {
  const config = readProjectConfiguration(tree, projectName);
  
  expect(config).toBeDefined();
  expect(config.root).toBeDefined();
  expect(config.projectType).toBe('application');
  
  // Verify Astro NX targets are configured
  expect(config.targets?.dev).toEqual({
    executor: 'astro-nx:dev',
  });
  expect(config.targets?.build).toEqual({
    executor: 'astro-nx:build',
  });
  expect(config.targets?.preview).toEqual({
    executor: 'astro-nx:preview',
  });
  expect(config.targets?.check).toEqual({
    executor: 'astro-nx:check',
  });
  
  return config;
}

/**
 * Asserts that template files were copied correctly
 */
export async function assertTemplateFilesCopied(
  workspaceRoot: string, 
  projectRoot: string, 
  expectedFiles: string[]
) {
  for (const file of expectedFiles) {
    const filePath = join(workspaceRoot, projectRoot, file);
    await expect(access(filePath)).resolves.not.toThrow();
  }
}

/**
 * Asserts that certain files/directories are excluded from copying
 */
export async function assertExcludedFiles(
  workspaceRoot: string, 
  projectRoot: string, 
  excludedFiles: string[]
) {
  for (const file of excludedFiles) {
    const filePath = join(workspaceRoot, projectRoot, file);
    expect(existsSync(filePath)).toBe(false);
  }
}

/**
 * Reads and parses package.json from the generated project
 */
export async function readProjectPackageJson(workspaceRoot: string, projectRoot: string) {
  const packageJsonPath = join(workspaceRoot, projectRoot, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath, 'utf8');
  return JSON.parse(packageJsonContent);
}

/**
 * Common template files that should exist in most Astro templates
 */
export const COMMON_TEMPLATE_FILES = [
  'astro.config.mjs',
  'package.json',
  'tsconfig.json',
  'src/env.d.ts',
  'public',
];

/**
 * Files/directories that should be excluded from copying
 */
export const EXCLUDED_FILES = [
  'node_modules',
  'dist',
  '.astro',
];

/**
 * Available templates for testing
 */
export const AVAILABLE_TEMPLATES = [
  'astro-minimal',
  'astro-mdx', 
  'astro-preact',
] as const;

export type AvailableTemplate = typeof AVAILABLE_TEMPLATES[number];
