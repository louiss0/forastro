import { posix, parse } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { slugify } from '../strings/slug.js';

// Re-export case utilities for backward compatibility
export { toPascalCase, toCamelCase, toKebabCase } from '../strings/case.js';

export interface PathGenerationOptions {
  projectRoot: string;
  srcDir?: string;
  type: 'page' | 'component' | 'layout' | 'content' | 'astro-file';
  name: string;
  subdir?: string;
  extension?: string;
}

export interface GeneratedPath {
  fullPath: string;
  relativePath: string;
  directory: string;
  filename: string;
  extension: string;
}

export function generateAstroPath(options: PathGenerationOptions): GeneratedPath {
  const { projectRoot, srcDir = 'src', type, name, subdir, extension } = options;
  
  let directory: string;
  let defaultExtension: string;
  
  switch (type) {
    case 'page':
      directory = posix.join(projectRoot, srcDir, 'pages');
      defaultExtension = '.astro';
      break;
    case 'component':
      directory = posix.join(projectRoot, srcDir, 'components');
      defaultExtension = '.astro';
      break;
    case 'layout':
      directory = posix.join(projectRoot, srcDir, 'layouts');
      defaultExtension = '.astro';
      break;
    case 'content':
      directory = posix.join(projectRoot, srcDir, 'content');
      defaultExtension = '.md';
      break;
    case 'astro-file':
      directory = posix.join(projectRoot, srcDir);
      defaultExtension = '.astro';
      break;
    default:
      throw new Error(`Unknown path type: ${type}`);
  }
  
  // Add subdirectory if specified
  if (subdir) {
    directory = posix.join(directory, subdir);
  }
  
  const fileExtension = extension || defaultExtension;
  const filename = ensureExtension(name, fileExtension);
  const fullPath = posix.join(directory, filename);
  const relativePath = fullPath.replace(projectRoot + '/', '');
  
  return {
    fullPath,
    relativePath,
    directory,
    filename,
    extension: fileExtension,
  };
}

export function generateContentPath(projectRoot: string, collectionName: string, filename: string): GeneratedPath {
  const directory = posix.join(projectRoot, 'src', 'content', collectionName);
  const fullPath = posix.join(directory, ensureExtension(filename, '.md'));
  const relativePath = fullPath.replace(projectRoot + '/', '');
  
  return {
    fullPath,
    relativePath,
    directory,
    filename: ensureExtension(filename, '.md'),
    extension: '.md',
  };
}

export function generatePagePath(projectRoot: string, pageName: string, nested?: string): GeneratedPath {
  let directory = posix.join(projectRoot, 'src', 'pages');
  
  if (nested) {
    directory = posix.join(directory, nested);
  }
  
  const filename = ensureExtension(pageName, '.astro');
  const fullPath = posix.join(directory, filename);
  const relativePath = fullPath.replace(projectRoot + '/', '');
  
  return {
    fullPath,
    relativePath,
    directory,
    filename,
    extension: '.astro',
  };
}

export function generateComponentPath(projectRoot: string, componentName: string, subdir?: string): GeneratedPath {
  let directory = posix.join(projectRoot, 'src', 'components');
  
  if (subdir) {
    directory = posix.join(directory, subdir);
  }
  
  const filename = ensureExtension(componentName, '.astro');
  const fullPath = posix.join(directory, filename);
  const relativePath = fullPath.replace(projectRoot + '/', '');
  
  return {
    fullPath,
    relativePath,
    directory,
    filename,
    extension: '.astro',
  };
}

export function ensureExtension(filename: string, defaultExtension: string): string {
  const parsed = parse(filename);
  
  if (parsed.ext) {
    return filename;
  }
  
  return filename + defaultExtension;
}

export function createDirectoryPath(basePath: string, ...segments: string[]): string {
  return posix.join(basePath, ...segments);
}

export function normalizeFileName(name: string): string {
  // Use custom logic to preserve valid filename characters like dots and underscores
  // while still making it filesystem-safe
  return name
    .trim()
    // Replace problematic characters with dashes (more comprehensive)
    .replace(/[<>:"/\\|?*!@#$%^&()+={}\[\],`~]/g, '-')
    // Replace whitespace with dashes
    .replace(/\s+/g, '-')
    // Normalize multiple dashes to single
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Get the pages directory path for a project
 * @param projectRoot - The root directory of the project
 * @returns The pages directory path (src/pages)
 */
export function getPagesDir(projectRoot: string): string {
  return posix.join(projectRoot, 'src', 'pages');
}

/**
 * Get the components directory path for a project
 * @param projectRoot - The root directory of the project
 * @returns The components directory path (src/components)
 */
export function getComponentsDir(projectRoot: string): string {
  return posix.join(projectRoot, 'src', 'components');
}

/**
 * Get the content directory path for a project
 * Prefers src/content if it exists, otherwise uses content
 * 
 * Why this preference: Astro supports both src/content (newer, organized)
 * and content/ (legacy) structures. We prefer the organized approach.
 * 
 * @param projectRoot - The root directory of the project
 * @returns The content directory path (src/content or content)
 */
export function getContentDir(projectRoot: string): string {
  const srcContentDir = posix.join(projectRoot, 'src', 'content');
  const contentDir = posix.join(projectRoot, 'content');
  
  // Prefer src/content if it exists, otherwise use content
  if (existsSync(srcContentDir)) {
    return srcContentDir;
  }
  
  return contentDir;
}

/**
 * Ensure directories exist by creating them if they're missing
 * @param dirs - Array of directory paths to ensure exist
 */
export function ensureDirs(...dirs: string[]): void {
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
