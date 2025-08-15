import { type Tree } from '@nx/devkit';
import { join } from 'path';

/**
 * Options for safeWriteFile operation
 */
export interface SafeWriteOptions {
  /** Whether to allow overwriting existing files. Defaults to false. */
  overwrite?: boolean;
}

/**
 * Ensures that a directory exists in the Nx Tree by creating it via a sentinel approach.
 * Uses lazy creation via tree.write of .gitkeep if the directory doesn't exist yet.
 * 
 * This maintains consistency with Nx patterns by using the tree.exists check on a sentinel
 * and only creates the directory structure when actually needed.
 * 
 * @param tree - The Nx Tree instance
 * @param dir - The directory path to ensure exists
 */
export function ensureDir(tree: Tree, dir: string): void {
  // Skip if the directory already exists (check via sentinel)
  if (tree.exists(dir)) {
    return;
  }

  // Create directory structure segment by segment using .gitkeep sentinel approach
  const pathParts = dir.split('/').filter((part) => part.length > 0);
  let currentPath = '';

  for (const part of pathParts) {
    currentPath = currentPath ? join(currentPath, part) : part;
    if (!tree.exists(currentPath)) {
      // Lazy creation via .gitkeep sentinel - this forces Nx to recognize the directory
      const gitkeepPath = join(currentPath, '.gitkeep');
      tree.write(gitkeepPath, '');
      tree.delete(gitkeepPath);
    }
  }
}

/**
 * Safely writes a file to the tree with deterministic overwrite behavior.
 * 
 * @param tree - The Nx Tree instance
 * @param filePath - Path to the file to write
 * @param content - Content to write to the file
 * @param options - Write options including overwrite behavior
 * @throws Error if file exists and overwrite is false
 */
export function safeWriteFile(
  tree: Tree, 
  filePath: string, 
  content: string,
  options: SafeWriteOptions = {}
): void {
  const { overwrite = false } = options;

  // Check if file already exists
  if (tree.exists(filePath) && !overwrite) {
    // Match test suite's expected error wording
    throw new Error(`File already exists at "${filePath}". Use --overwrite to replace it.`);
  }

  // Ensure the parent directory exists
  const parentDir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (parentDir && parentDir !== filePath) {
    ensureDir(tree, parentDir);
  }

  // Write the file
  tree.write(filePath, content);
}

/**
 * Checks if a file exists in the tree.
 * 
 * @param tree - The Nx Tree instance
 * @param path - Path to check for existence
 * @returns true if the file exists, false otherwise
 */
export function fileExists(tree: Tree, path: string): boolean {
  return tree.exists(path);
}

/**
 * Reads text content from a file in the tree.
 * 
 * @param tree - The Nx Tree instance
 * @param path - Path to the file to read
 * @returns The file content as a string
 * @throws Error if file doesn't exist
 */
export function readText(tree: Tree, path: string): string {
  if (!tree.exists(path)) {
    throw new Error(`File "${path}" does not exist`);
  }
  
  const buffer = tree.read(path);
  if (!buffer) {
    throw new Error(`Unable to read file "${path}"`);
  }
  
  return buffer.toString('utf-8');
}

/**
 * Writes text content to a file in the tree.
 * This is a convenience wrapper around safeWriteFile with overwrite enabled.
 * 
 * @param tree - The Nx Tree instance
 * @param path - Path to the file to write
 * @param content - Text content to write
 */
export function writeText(tree: Tree, path: string, content: string): void {
  safeWriteFile(tree, path, content, { overwrite: true });
}
