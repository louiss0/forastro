import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ensureTreeDirs } from './tree-io';

describe('tree-io', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('ensureTreeDirs', () => {
    it('should enable successful file writes to nested directories', () => {
      const targetDir = 'apps/test-app/src/components/ui';
      const filePath = `${targetDir}/modal.astro`;
      
      // Ensure the directory exists
      ensureTreeDirs(tree, targetDir);
      
      // Should be able to write file without errors
      expect(() => {
        tree.write(filePath, '// Modal component');
      }).not.toThrow();
      
      // File should exist after write
      expect(tree.exists(filePath)).toBe(true);
    });

    it('should handle already existing directories gracefully', () => {
      const targetDir = 'apps/existing';
      const existingFile = `${targetDir}/package.json`;
      
      // Create directory with a file first
      tree.write(existingFile, '{}');
      expect(tree.exists(existingFile)).toBe(true);
      
      // This should not fail or affect existing files
      expect(() => {
        ensureTreeDirs(tree, targetDir);
      }).not.toThrow();
      
      expect(tree.exists(existingFile)).toBe(true);
    });

    it('should work with multiple levels of nested directories', () => {
      const deepDir = 'apps/project/src/pages/admin/settings/users';
      const testFile = `${deepDir}/index.astro`;
      
      // Ensure deeply nested directory
      ensureTreeDirs(tree, deepDir);
      
      // Should be able to write files at any level
      expect(() => {
        tree.write(testFile, '// Admin users page');
        tree.write('apps/project/src/pages/admin/index.astro', '// Admin page');
      }).not.toThrow();
      
      expect(tree.exists(testFile)).toBe(true);
      expect(tree.exists('apps/project/src/pages/admin/index.astro')).toBe(true);
    });

    it('should not leave .gitkeep artifacts', () => {
      const targetDir = 'apps/clean-test/src/components';
      
      ensureTreeDirs(tree, targetDir);
      
      // Write a real file to make sure directory exists
      tree.write(`${targetDir}/test.astro`, '// Test component');
      
      // Check that no .gitkeep files remain
      const files = tree.listChanges();
      const gitkeepFiles = files.filter(file => file.path.endsWith('.gitkeep'));
      
      expect(gitkeepFiles.length).toBe(0);
      expect(tree.exists(`${targetDir}/test.astro`)).toBe(true);
    });
  });
});
