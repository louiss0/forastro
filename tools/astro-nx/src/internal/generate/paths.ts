import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { posix } from 'path';

/**
 * Project paths structure returned by getProjectPaths
 */
export interface ProjectPaths {
  /** Project root directory (e.g., "apps/my-app" or "packages/my-lib") */
  root: string;
  /** Source root directory (e.g., "apps/my-app/src") */
  srcRoot: string;
  /** Pages directory (e.g., "apps/my-app/src/pages") */
  pagesDir: string;
  /** Components directory (e.g., "apps/my-app/src/components") */
  componentsDir: string;
  /** Layouts directory (e.g., "apps/my-app/src/layouts") */
  layoutsDir: string;
  /** Content directory (e.g., "apps/my-app/src/content") */
  contentDir: string;
  /** Public directory (e.g., "apps/my-app/public") */
  publicDir: string;
}

/**
 * Gets project paths using Nx project configuration
 * This eliminates hardcoded 'apps/' assumptions and works with any project structure
 * 
 * @param tree - The Nx file tree
 * @param projectName - Name of the project to get paths for
 * @returns ProjectPaths object with all relevant directory paths
 * @throws Error if project is not found in workspace
 */
export function getProjectPaths(tree: Tree, projectName: string): ProjectPaths {
  // Get project configuration from Nx workspace
  const projectConfig = readProjectConfiguration(tree, projectName);
  
  // Use Nx-provided project root - this handles apps/, packages/, libs/, etc.
  const root = normalizeToPosix(projectConfig.root);
  
  // Use sourceRoot if available, otherwise default to src under project root
  const srcRoot = projectConfig.sourceRoot
    ? normalizeToPosix(projectConfig.sourceRoot)
    : normalizeToPosix(posix.join(root, 'src'));

  // Build all standard Astro directories using posix paths for consistency
  const pagesDir = normalizeToPosix(posix.join(srcRoot, 'pages'));
  const componentsDir = normalizeToPosix(posix.join(srcRoot, 'components'));
  const layoutsDir = normalizeToPosix(posix.join(srcRoot, 'layouts'));
  const contentDir = normalizeToPosix(posix.join(srcRoot, 'content'));
  const publicDir = normalizeToPosix(posix.join(root, 'public'));

  return {
    root,
    srcRoot,
    pagesDir,
    componentsDir,
    layoutsDir,
    contentDir,
    publicDir,
  };
}

/**
 * Normalizes a path to use POSIX separators (forward slashes)
 * This ensures consistent path separators across all operating systems
 * and eliminates platform-specific separator inconsistencies in tests
 * 
 * @param path - Path to normalize
 * @returns Path with POSIX separators
 */
export function normalizeToPosix(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Builds a path using posix separators for consistency
 * This is a convenience wrapper around path.posix.join with normalization
 * 
 * @param segments - Path segments to join
 * @returns Joined path with POSIX separators
 */
export function buildPath(...segments: string[]): string {
  return normalizeToPosix(posix.join(...segments));
}

/**
 * Gets the full path for a file within a project directory
 * Uses project configuration to resolve paths correctly
 * 
 * @param tree - The Nx file tree
 * @param projectName - Name of the project
 * @param type - Type of file/directory ('pages', 'components', 'layouts', 'content', 'public', or 'src')
 * @param relativePath - Relative path within the directory type
 * @returns Full path to the file
 */
export function getProjectFilePath(
  tree: Tree,
  projectName: string,
  type: 'pages' | 'components' | 'layouts' | 'content' | 'public' | 'src',
  relativePath: string = ''
): string {
  const paths = getProjectPaths(tree, projectName);
  
  let baseDir: string;
  switch (type) {
    case 'pages':
      baseDir = paths.pagesDir;
      break;
    case 'components':
      baseDir = paths.componentsDir;
      break;
    case 'layouts':
      baseDir = paths.layoutsDir;
      break;
    case 'content':
      baseDir = paths.contentDir;
      break;
    case 'public':
      baseDir = paths.publicDir;
      break;
    case 'src':
      baseDir = paths.srcRoot;
      break;
    default:
      throw new Error(`Unknown directory type: ${type}`);
  }
  
  return relativePath
    ? buildPath(baseDir, relativePath)
    : baseDir;
}

/**
 * Legacy compatibility function for existing code that expects projectRoot
 * @deprecated Use getProjectPaths instead
 */
export function getProjectRoot(tree: Tree, projectName: string): string {
  const paths = getProjectPaths(tree, projectName);
  return paths.root;
}
