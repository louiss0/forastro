import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import { getProjects } from '@nx/devkit';
import type { ProjectType } from '../detect/project-type';
import { getProjectType, getDefaultContentExt } from '../detect/project-type';
import { findAstroConfig, hasContentCollections, readIntegrations } from '../detect/config';

export interface DiscoveredAstroProject {
  name: string;
  path: string;
  relativePath: string;
  projectType: ProjectType;
  defaultContentExt: string;
  configPath: string | null;
  hasContentCollections: boolean;
  integrations: string[];
  isNxProject: boolean;
  hasPackageJson: boolean;
}

export interface DiscoverProjectsOptions {
  workspaceRoot?: string;
  includeNested?: boolean;
  maxDepth?: number;
}

export function discoverAstroProjects(options: DiscoverProjectsOptions = {}): DiscoveredAstroProject[] {
  const { workspaceRoot = process.cwd(), includeNested = true, maxDepth = 3 } = options;
  
  const projects: DiscoveredAstroProject[] = [];
  const visited = new Set<string>();
  
  function searchDirectory(dirPath: string, depth = 0): void {
    if (depth > maxDepth || visited.has(dirPath)) {
      return;
    }
    
    visited.add(dirPath);
    
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const fullPath = join(dirPath, entry.name);
        const relativePath = fullPath.replace(workspaceRoot + '/', '');
        
        // Skip common directories that won't contain Astro projects
        if (shouldSkipDirectory(entry.name)) {
          continue;
        }
        
        // Check if this directory is an Astro project
        if (isAstroProject(fullPath)) {
          const projectType = getProjectType(fullPath);
          const defaultContentExt = getDefaultContentExt(fullPath);
          const configPath = findAstroConfig(fullPath);
          const hasContentColls = hasContentCollections(fullPath);
          const integrations = readIntegrations(fullPath);
          
          projects.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            projectType,
            defaultContentExt,
            configPath,
            hasContentCollections: hasContentColls,
            integrations,
            isNxProject: hasNxProjectJson(fullPath),
            hasPackageJson: hasPackageJson(fullPath),
          });
        }
        
        // Continue searching nested directories if enabled
        if (includeNested) {
          searchDirectory(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore directories we can't read
    }
  }
  
  searchDirectory(workspaceRoot);
  
  return projects;
}

export function isAstroProject(projectPath: string): boolean {
  // Check for package.json with astro dependency
  const packageJsonPath = join(projectPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = require(packageJsonPath);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.astro) {
        return true;
      }
    } catch {
      // Ignore parsing errors
    }
  }
  
  // Check for Astro config file
  const configNames = [
    'astro.config.mjs',
    'astro.config.js',
    'astro.config.ts',
    'astro.config.cjs'
  ];
  
  for (const configName of configNames) {
    if (existsSync(join(projectPath, configName))) {
      return true;
    }
  }
  
  // Check for typical Astro src structure
  const srcPath = join(projectPath, 'src');
  if (existsSync(srcPath)) {
    const pagesPath = join(srcPath, 'pages');
    const componentsPath = join(srcPath, 'components');
    const layoutsPath = join(srcPath, 'layouts');
    
    if (existsSync(pagesPath) || existsSync(componentsPath) || existsSync(layoutsPath)) {
      return true;
    }
  }
  
  return false;
}

export function findAstroProjectsInWorkspace(workspaceRoot: string): string[] {
  const projects = discoverAstroProjects({ workspaceRoot });
  return projects.map(p => p.relativePath);
}

/**
 * Lists Astro projects in an Nx workspace using Nx-specific heuristics.
 * This function is designed for use with Nx Tree or workspace integration.
 * 
 * Heuristics:
 * 1. project.json targets referencing @forastro/astro-nx executors
 * 2. presence of astro.config.*
 * 3. src/pages exists
 * 
 * @param treeOrWorkspaceRoot - Either an Nx Tree object or a workspace root path
 * @returns Array of project names that are detected as Astro projects
 */
export function listAstroProjects(treeOrWorkspaceRoot: Tree | string): string[] {
  const astroProjects: string[] = [];
  
  if (typeof treeOrWorkspaceRoot === 'string') {
    // Handle filesystem-based discovery
    return listAstroProjectsFromFilesystem(treeOrWorkspaceRoot);
  }
  
  // Handle Nx Tree-based discovery
  const tree = treeOrWorkspaceRoot;
  const projects = getProjects(tree);
  
  for (const [projectName, projectConfig] of projects.entries()) {
    if (isAstroProjectByHeuristics(tree, projectName, projectConfig)) {
      astroProjects.push(projectName);
    }
  }
  
  return astroProjects;
}

/**
 * Lists Astro projects from filesystem when Tree is not available
 */
function listAstroProjectsFromFilesystem(workspaceRoot: string): string[] {
  const astroProjects: string[] = [];
  
  try {
    // Look for project.json files in the workspace
    const projectJsonFiles = findProjectJsonFiles(workspaceRoot);
    
    for (const projectJsonPath of projectJsonFiles) {
      const projectDir = projectJsonPath.replace('/project.json', '');
      const projectName = projectDir.split('/').pop() || '';
      
      if (isAstroProjectByFilesystemHeuristics(projectDir, workspaceRoot)) {
        astroProjects.push(projectName);
      }
    }
  } catch {
    // Fallback to the existing discovery method
    return findAstroProjectsInWorkspace(workspaceRoot);
  }
  
  return astroProjects;
}

/**
 * Determines if a project is an Astro project using Nx-specific heuristics
 */
function isAstroProjectByHeuristics(
  tree: Tree,
  _projectName: string,
  projectConfig: ProjectConfiguration
): boolean {
  const projectRoot = projectConfig.root;
  
  // Heuristic 1: Check if project.json targets reference @forastro/astro-nx executors
  if (hasForAstroNxExecutors(projectConfig)) {
    return true;
  }
  
  // Heuristic 2: Check for presence of astro.config.*
  const astroConfigFiles = [
    'astro.config.mjs',
    'astro.config.js', 
    'astro.config.ts',
    'astro.config.cjs'
  ];
  
  for (const configFile of astroConfigFiles) {
    const configPath = join(projectRoot, configFile);
    if (tree.exists(configPath)) {
      return true;
    }
  }
  
  // Heuristic 3: Check if src/pages exists
  const srcPagesPath = join(projectRoot, 'src', 'pages');
  if (tree.exists(srcPagesPath)) {
    return true;
  }
  
  return false;
}

/**
 * Filesystem-based heuristics for detecting Astro projects
 */
function isAstroProjectByFilesystemHeuristics(projectPath: string): boolean {
  // Heuristic 1: Check project.json for @forastro/astro-nx executors
  const projectJsonPath = join(projectPath, 'project.json');
  if (existsSync(projectJsonPath)) {
    try {
      const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
      if (hasForAstroNxExecutors(projectJson)) {
        return true;
      }
    } catch {
      // Ignore parsing errors
    }
  }
  
  // Heuristic 2: Check for presence of astro.config.*
  const astroConfigFiles = [
    'astro.config.mjs',
    'astro.config.js',
    'astro.config.ts', 
    'astro.config.cjs'
  ];
  
  for (const configFile of astroConfigFiles) {
    if (existsSync(join(projectPath, configFile))) {
      return true;
    }
  }
  
  // Heuristic 3: Check if src/pages exists
  const srcPagesPath = join(projectPath, 'src', 'pages');
  if (existsSync(srcPagesPath)) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a project configuration has targets using @forastro/astro-nx executors
 */
function hasForAstroNxExecutors(projectConfig: ProjectConfiguration): boolean {
  if (!projectConfig.targets) {
    return false;
  }
  
  const forastroExecutors = [
    '@forastro/astro-nx:build',
    '@forastro/astro-nx:dev', 
    '@forastro/astro-nx:preview',
    '@forastro/astro-nx:check'
  ];
  
  for (const target of Object.values(projectConfig.targets)) {
    if (target.executor && forastroExecutors.includes(target.executor)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Recursively finds all project.json files in a workspace
 */
function findProjectJsonFiles(workspaceRoot: string): string[] {
  const projectJsonFiles: string[] = [];
  
  function searchDirectory(dirPath: string, depth = 0): void {
    if (depth > 5) { // Limit recursion depth
      return;
    }
    
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (shouldSkipDirectory(entry.name)) {
          continue;
        }
        
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isFile() && entry.name === 'project.json') {
          projectJsonFiles.push(fullPath);
        } else if (entry.isDirectory()) {
          searchDirectory(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore directories we can't read
    }
  }
  
  searchDirectory(workspaceRoot);
  return projectJsonFiles;
}

function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = [
    'node_modules',
    '.git',
    '.nx',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.output',
    'coverage',
    '.turbo',
    '.cache',
    'tmp',
    'temp',
  ];
  
  return skipDirs.includes(dirName) || dirName.startsWith('.');
}

function hasNxProjectJson(projectPath: string): boolean {
  return existsSync(join(projectPath, 'project.json'));
}

function hasPackageJson(projectPath: string): boolean {
  return existsSync(join(projectPath, 'package.json'));
}

/**
 * Workspace-level generator options interface.
 * Used to extend generator schemas with bulk operations across all discovered Astro projects.
 */
export interface WorkspaceGeneratorOptions {
  /** Apply to all discovered Astro projects in the workspace */
  applyToAllAstroProjects?: boolean;
  /** Explicitly exclude certain projects from bulk operations */
  excludeProjects?: string[];
  /** Include only specific projects (if not provided, all discovered projects are used) */
  includeOnlyProjects?: string[];
}

/**
 * Resolves project names for bulk operations based on workspace generator options.
 * This function is used to populate x-prompt for "project" selection or astro-file bulk mode.
 * 
 * @param treeOrWorkspaceRoot - Either an Nx Tree object or workspace root path
 * @param options - Workspace generator options
 * @returns Array of project names to apply the generator to
 */
export function resolveProjectsForBulkOperation(
  treeOrWorkspaceRoot: Tree | string,
  options: WorkspaceGeneratorOptions = {}
): string[] {
  // Get all discovered Astro projects
  const allAstroProjects = listAstroProjects(treeOrWorkspaceRoot);
  
  let targetProjects = allAstroProjects;
  
  // Filter by includeOnlyProjects if specified
  if (options.includeOnlyProjects && options.includeOnlyProjects.length > 0) {
    targetProjects = targetProjects.filter(project => 
      (options.includeOnlyProjects ?? []).includes(project)
    );
  }
  
  // Exclude projects if specified
  if (options.excludeProjects && options.excludeProjects.length > 0) {
    targetProjects = targetProjects.filter(project => 
      !(options.excludeProjects ?? []).includes(project)
    );
  }
  
  return targetProjects;
}

/**
 * Creates an x-prompt choices array for project selection.
 * This is used in generator schemas to provide interactive project selection.
 * 
 * @param treeOrWorkspaceRoot - Either an Nx Tree object or workspace root path
 * @returns Array of choice objects with name and value for x-prompt
 */
export function createProjectChoicesForPrompt(
  treeOrWorkspaceRoot: Tree | string
): Array<{ name: string; value: string }> {
  const astroProjects = listAstroProjects(treeOrWorkspaceRoot);
  
  return astroProjects.map(projectName => ({
    name: projectName,
    value: projectName
  }));
}

/**
 * Enhanced generator schema mixin that provides workspace-level bulk operations.
 * Generators can extend their schema with this interface to support bulk operations.
 */
export interface BulkGeneratorSchemaMixin extends WorkspaceGeneratorOptions {
  /** Enable bulk mode to apply to multiple projects */
  bulk?: boolean;
  /** Array of specific projects to target (used with bulk mode) */
  projects?: string[];
}

/**
 * Utility function to expand bulk generator options into individual project operations.
 * This should be used at the beginning of generator functions to handle bulk mode.
 * 
 * @param tree - Nx Tree object
 * @param options - Generator options that may include bulk settings
 * @returns Array of individual project options or single option array
 */
export function expandBulkGeneratorOptions<T extends BulkGeneratorSchemaMixin>(
  tree: Tree,
  options: T
): Array<Omit<T, keyof BulkGeneratorSchemaMixin> & { project: string }> {
  // If not in bulk mode, return single operation
  if (!options.bulk) {
    const { ...restOptions } = options;
    return [restOptions as Omit<T, keyof BulkGeneratorSchemaMixin> & { project: string }];
  }
  
  // Determine target projects for bulk operation
  let targetProjects: string[] = [];
  
  if (options.applyToAllAstroProjects) {
    // Use workspace-level discovery
    targetProjects = resolveProjectsForBulkOperation(tree, {
      excludeProjects: options.excludeProjects,
      includeOnlyProjects: options.includeOnlyProjects
    });
  } else if (options.projects && options.projects.length > 0) {
    // Use explicitly provided projects
    targetProjects = options.projects;
  } else {
    throw new Error('Bulk mode requires either applyToAllAstroProjects=true or a non-empty projects array');
  }
  
  // Create individual operations for each target project
  const { ...baseOptions } = options;
  
  return targetProjects.map(projectName => ({
    ...baseOptions,
    project: projectName
  })) as Array<Omit<T, keyof BulkGeneratorSchemaMixin> & { project: string }>;
}
