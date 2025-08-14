import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';

/**
 * Standardized validation functions for Astro-Nx generators and executors
 * 
 * This module provides minimal custom validators to ensure consistent error handling
 * across all generators and executors without adding new dependencies.
 */

/**
 * Validates that a project exists in the Nx workspace
 */
export function validateProjectExists(tree: Tree, project: string): void {
  if (!project) {
    throw new Error('Project name cannot be empty');
  }

  if (typeof project !== 'string' || project.trim() === '') {
    throw new Error('Project name cannot be empty');
  }

  try {
    readProjectConfiguration(tree, project);
  } catch {
    throw new Error(`Project "${project}" does not exist in the workspace`);
  }
}

/**
 * Validates that a field is a non-empty string
 */
export function validateNonEmptyString(field: string | undefined, name: string): void {
  if (field === undefined || field === null) {
    throw new Error(`${name} is required`);
  }

  if (typeof field !== 'string') {
    throw new Error(`${name} must be a string`);
  }

  if (field.trim() === '') {
    throw new Error(`${name} cannot be empty`);
  }
}

/**
 * Validates that a file does not exist, unless overwrite is enabled
 */
export function validateFileDoesNotExist(
  tree: Tree, 
  path: string, 
  overwrite: boolean = false
): void {
  if (!overwrite && tree.exists(path)) {
    throw new Error(`File already exists at "${path}". Use --overwrite to replace it.`);
  }
}

/**
 * Validates that a field value is one of the allowed enum values
 */
export function validateEnum<T extends string>(
  field: T | undefined, 
  allowedValues: readonly T[], 
  fieldName: string
): void {
  if (field === undefined || field === null) {
    return; // Allow undefined for optional enum fields
  }

  if (!allowedValues.includes(field)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}. Got: ${field}`);
  }
}
