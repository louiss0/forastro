import { Tree } from '@nx/devkit';
import { join } from 'path';

/**
 * Ensures that nested directories exist in the Nx Tree by creating them via .gitkeep
 * files which are then deleted. This is the standard pattern used across Astro NX generators.
 * 
 * Why the .gitkeep dance: Nx Tree requires files to exist before it recognizes directories.
 * The create-then-delete pattern is the canonical way to create empty directories in Nx.
 * This maintains consistency with existing generators while avoiding filesystem dependencies.
 * 
 * @param tree - The Nx Tree instance
 * @param targetDir - The directory path to ensure exists
 */
export function ensureTreeDirs(tree: Tree, targetDir: string): void {
  // Skip if the directory already exists
  if (tree.exists(targetDir)) {
    return;
  }

  // Create directory structure segment by segment using the same pattern
  // as the original generators (exactly matching the existing logic)
  const pathParts = targetDir.split('/');
  let currentPath = '';
  
  for (const part of pathParts) {
    currentPath = currentPath ? join(currentPath, part) : part;
    if (!tree.exists(currentPath)) {
      tree.write(join(currentPath, '.gitkeep'), '');
      tree.delete(join(currentPath, '.gitkeep'));
    }
  }
}
