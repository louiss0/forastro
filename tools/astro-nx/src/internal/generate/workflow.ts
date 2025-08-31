import type { Tree, GeneratorCallback } from '@nx/devkit';
import { formatFiles, runTasksInSerial } from '@nx/devkit';
import { validateNonEmptyString, validateProjectExists, validateEnum, validateFileDoesNotExist } from '../validate/options.js';
import { getProjectPaths, buildPath } from './paths.js';

/**
 * Common options that all generators support
 */
export interface BaseGeneratorOptions {
  name: string;
  project: string;
  directory?: string;
  skipFormat?: boolean;
  overwrite?: boolean;
}

/**
 * Normalized options with computed paths and project information
 */
export interface NormalizedBaseOptions {
  name: string;
  projectName: string;
  projectPaths: ReturnType<typeof getProjectPaths>;
  directory?: string;
  skipFormat: boolean;
  overwrite: boolean;
}

/**
 * Generator workflow configuration
 */
export interface GeneratorWorkflowConfig<T extends BaseGeneratorOptions> {
  /** Options validation rules */
  validation: {
    enumFields?: Array<{
      field: keyof T;
      allowedValues: readonly string[];
    }>;
    customValidators?: Array<(options: T) => void>;
  };
  /** Path resolution configuration */
  pathResolution: {
    /** Target directory type (pages, components, etc.) */
    targetType: 'pages' | 'components' | 'layouts' | 'content' | 'public' | 'src';
    /** File extension (with or without dot) */
    extension: string;
    /** Whether to use kebab-case for filenames */
    useKebabCase?: boolean;
    /** Custom path resolver function */
    customPathResolver?: (options: T, normalizedBase: NormalizedBaseOptions) => string;
  };
  /** Generation function */
  generate: (tree: Tree, options: T & NormalizedBaseOptions, targetPath: string) => void;
}

/**
 * Shared generator workflow that handles common tasks:
 * - Standardized validation
 * - Options normalization
 * - Path resolution
 * - Idempotent file creation checks
 * - Formatting
 * 
 * This consolidates the scattered validation logic mentioned in the TODO.
 */
export async function runGeneratorWorkflow<T extends BaseGeneratorOptions>(
  tree: Tree,
  options: T,
  config: GeneratorWorkflowConfig<T>
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];

  // Apply standardized validations
  validateNonEmptyString(options.name, 'name');
  validateNonEmptyString(options.project, 'project');
  validateProjectExists(tree, options.project);

  // Apply enum validations
  if (config.validation.enumFields) {
    for (const enumField of config.validation.enumFields) {
      const value = options[enumField.field] as string;
      validateEnum(value, enumField.allowedValues, String(enumField.field));
    }
  }

  // Apply custom validations
  if (config.validation.customValidators) {
    for (const validator of config.validation.customValidators) {
      validator(options);
    }
  }

  // Normalize options
  const normalizedBase = normalizeBaseOptions(tree, options);
  const normalizedOptions = { ...options, ...normalizedBase };

  // Resolve target path
  const targetPath = resolveTargetPath(normalizedOptions, config.pathResolution);

  // Check for idempotent behavior - file collision detection
  if (!normalizedOptions.overwrite) {
    validateFileDoesNotExist(tree, targetPath, false);
  }

  // Generate the file/content
  config.generate(tree, normalizedOptions, targetPath);

  // Format files if not skipped
  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

/**
 * Normalizes common base options for all generators
 * Eliminates duplication across generator normalizeOptions functions
 */
export function normalizeBaseOptions(
  tree: Tree,
  options: BaseGeneratorOptions
): NormalizedBaseOptions {
  const projectName = options.project;
  const projectPaths = getProjectPaths(tree, projectName);

  return {
    name: options.name,
    projectName,
    projectPaths,
    directory: options.directory,
    skipFormat: options.skipFormat ?? false,
    overwrite: options.overwrite ?? false,
  };
}

/**
 * Resolves the target file path using shared logic
 * Consolidates path resolution patterns from different generators
 */
export function resolveTargetPath<T extends BaseGeneratorOptions>(
  options: T & NormalizedBaseOptions,
  pathConfig: GeneratorWorkflowConfig<T>['pathResolution']
): string {
  // Use custom path resolver if provided
  if (pathConfig.customPathResolver) {
    return pathConfig.customPathResolver(options, options);
  }

  // Get base directory from project paths
  let baseDir: string;
  switch (pathConfig.targetType) {
    case 'pages':
      baseDir = options.projectPaths.pagesDir;
      break;
    case 'components':
      baseDir = options.projectPaths.componentsDir;
      break;
    case 'layouts':
      baseDir = options.projectPaths.layoutsDir;
      break;
    case 'content':
      baseDir = options.projectPaths.contentDir;
      break;
    case 'public':
      baseDir = options.projectPaths.publicDir;
      break;
    case 'src':
      baseDir = options.projectPaths.srcRoot;
      break;
    default:
      throw new Error(`Unknown target type: ${pathConfig.targetType}`);
  }

  // Handle directory option
  const targetDir = options.directory 
    ? buildPath(baseDir, options.directory) 
    : baseDir;

  // Handle name formatting
  let fileName = options.name;
  if (pathConfig.useKebabCase) {
    fileName = toKebabCase(fileName);
  }

  // Handle file extension
  const extension = pathConfig.extension.startsWith('.') 
    ? pathConfig.extension 
    : `.${pathConfig.extension}`;

  const fullFileName = `${fileName}${extension}`;

  return buildPath(targetDir, fullFileName);
}

/**
 * Converts a string to kebab-case
 * Extracted from existing string utilities for consistency
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Advanced options normalization with additional computed properties
 * For generators that need more complex normalization logic
 */
export interface AdvancedNormalizedOptions<T> extends NormalizedBaseOptions {
  /** Computed file name (without extension) */
  fileName: string;
  /** Computed full file name (with extension) */
  fullFileName: string;
  /** Computed target directory path */
  targetDir: string;
  /** Computed full file path */
  targetPath: string;
  /** Original options merged with computed ones */
  originalOptions: T;
}

/**
 * Advanced normalization for generators that need pre-computed paths and names
 */
export function normalizeAdvancedOptions<T extends BaseGeneratorOptions>(
  tree: Tree,
  options: T,
  pathConfig: GeneratorWorkflowConfig<T>['pathResolution']
): AdvancedNormalizedOptions<T> {
  const base = normalizeBaseOptions(tree, options);
  const normalizedOptions = { ...options, ...base };
  
  // Resolve paths and names
  const targetPath = resolveTargetPath(normalizedOptions, pathConfig);
  const fileName = pathConfig.useKebabCase ? toKebabCase(options.name) : options.name;
  const extension = pathConfig.extension.startsWith('.') 
    ? pathConfig.extension 
    : `.${pathConfig.extension}`;
  const fullFileName = `${fileName}${extension}`;
  
  // Extract target directory from full path
  const pathSegments = targetPath.split('/');
  const targetDir = pathSegments.slice(0, -1).join('/');

  return {
    ...base,
    fileName,
    fullFileName,
    targetDir,
    targetPath,
    originalOptions: options,
  };
}

/**
 * Utility for handling name-based directory nesting
 * Supports patterns like "blog/[slug]" in page names
 */
export function parseNestedName(name: string): {
  fileName: string;
  nameDirectory: string;
} {
  const nameParts = name.split('/');
  const fileName = nameParts[nameParts.length - 1];
  const nameDirectory = nameParts.length > 1 ? nameParts.slice(0, -1).join('/') : '';
  
  return { fileName, nameDirectory };
}

/**
 * Combines directory option with name-based directory
 */
export function combineDirectories(optionDirectory?: string, nameDirectory?: string): string {
  if (optionDirectory && nameDirectory) {
    return buildPath(optionDirectory, nameDirectory);
  }
  return optionDirectory || nameDirectory || '';
}
