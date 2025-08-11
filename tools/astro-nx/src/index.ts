/**
 * @forastro/astro-nx - Astro plugin for Nx
 * 
 * This package provides Nx executors and generators for Astro projects.
 * Nx uses the plugin.json file to resolve factories at runtime, so this
 * index only exports minimal public types and utilities for advanced users.
 */

// ====================
// Public Utility Functions
// ====================

/**
 * Utility functions for advanced users who need to detect project configuration
 * or determine appropriate file extensions for content generation.
 */
export { getDefaultContentExt, getProjectType } from './internal/detect/project-type';

// ====================
// Public Types (Schema Interfaces)
// ====================

/**
 * Type definitions for generator schemas - useful for programmatic usage
 * and providing better DX when working with the plugin programmatically.
 */
export type { PageGeneratorSchema } from './generators/page/generator';
export type { ComponentGeneratorSchema } from './generators/component/generator';
export type { ContentFileGeneratorSchema } from './generators/content-file/generator';
export type { AstroFileGeneratorSchema } from './generators/astro-file/generator';

/**
 * Type definitions for executor schemas - useful for programmatic usage
 * and providing better DX when configuring executors in project.json files.
 */
export type { DevExecutorSchema } from './executors/dev/executor';
export type { BuildExecutorSchema } from './executors/build/executor';
export type { PreviewExecutorSchema } from './executors/preview/executor';
export type { CheckExecutorSchema } from './executors/check/executor';

/**
 * Utility types for project detection and content extensions
 */
export type { ProjectType, ContentExtension } from './internal/detect/project-type';
