import { join, parse } from 'path';
import { mkdirSync, existsSync } from 'fs';

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
      directory = join(projectRoot, srcDir, 'pages');
      defaultExtension = '.astro';
      break;
    case 'component':
      directory = join(projectRoot, srcDir, 'components');
      defaultExtension = '.astro';
      break;
    case 'layout':
      directory = join(projectRoot, srcDir, 'layouts');
      defaultExtension = '.astro';
      break;
    case 'content':
      directory = join(projectRoot, srcDir, 'content');
      defaultExtension = '.md';
      break;
    case 'astro-file':
      directory = join(projectRoot, srcDir);
      defaultExtension = '.astro';
      break;
    default:
      throw new Error(`Unknown path type: ${type}`);
  }
  
  // Add subdirectory if specified
  if (subdir) {
    directory = join(directory, subdir);
  }
  
  const fileExtension = extension || defaultExtension;
  const filename = ensureExtension(name, fileExtension);
  const fullPath = join(directory, filename);
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
  const directory = join(projectRoot, 'src', 'content', collectionName);
  const fullPath = join(directory, ensureExtension(filename, '.md'));
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
  let directory = join(projectRoot, 'src', 'pages');
  
  if (nested) {
    directory = join(directory, nested);
  }
  
  const filename = ensureExtension(pageName, '.astro');
  const fullPath = join(directory, filename);
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
  let directory = join(projectRoot, 'src', 'components');
  
  if (subdir) {
    directory = join(directory, subdir);
  }
  
  const filename = ensureExtension(componentName, '.astro');
  const fullPath = join(directory, filename);
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
  return join(basePath, ...segments);
}

export function normalizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_.]/g, '-') // Replace invalid characters with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function toPascalCase(str: string): string {
  // Handle empty string
  if (!str) return str;
  
  // If input is already PascalCase or camelCase without separators, convert camelCase to PascalCase by uppercasing the first letter and keep internal capitals intact.
  // Why preserve existing case: Avoid breaking intentionally formatted names like "XMLHttp" or "iOS"
  if (!/[-_\s]/.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // For dashed/underscored/space-separated names, capitalize each segment and join.
  // Preserve internal capitalization in each word segment
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    // For PascalCase/camelCase inputs, split on capitals and join with '-' in lowercase.
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Convert spaces and underscores to dashes
    .replace(/[\s_]+/g, '-')
    // For already dashed inputs, normalize multiple dashes to single
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes and convert to lowercase
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Get the pages directory path for a project
 * @param projectRoot - The root directory of the project
 * @returns The pages directory path (src/pages)
 */
export function getPagesDir(projectRoot: string): string {
  return join(projectRoot, 'src', 'pages');
}

/**
 * Get the components directory path for a project
 * @param projectRoot - The root directory of the project
 * @returns The components directory path (src/components)
 */
export function getComponentsDir(projectRoot: string): string {
  return join(projectRoot, 'src', 'components');
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
  const srcContentDir = join(projectRoot, 'src', 'content');
  const contentDir = join(projectRoot, 'content');
  
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
