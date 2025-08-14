import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { 
  ensureDir,
  safeWriteFile,
  fileExists,
  readText,
  writeText,
  type SafeWriteOptions
} from './tree-ops';

describe('tree-ops', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('ensureDir', () => {
    it('should create nested directories reliably in memory', () => {
      const targetDir = 'apps/test-app/src/components/ui';
      
      // Directory should not exist initially
      expect(tree.exists(targetDir)).toBe(false);
      
      // Create the directory
      ensureDir(tree, targetDir);
      
      // Should be able to write files to the directory without errors
      const filePath = `${targetDir}/modal.astro`;
      expect(() => {
        tree.write(filePath, '// Modal component');
      }).not.toThrow();
      
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
        ensureDir(tree, targetDir);
      }).not.toThrow();
      
      expect(tree.exists(existingFile)).toBe(true);
    });

    it('should work with multiple levels of nested directories', () => {
      const deepDir = 'apps/project/src/pages/admin/settings/users';
      const testFile = `${deepDir}/index.astro`;
      
      // Ensure deeply nested directory
      ensureDir(tree, deepDir);
      
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
      
      ensureDir(tree, targetDir);
      
      // Write a real file to make sure directory exists
      tree.write(`${targetDir}/test.astro`, '// Test component');
      
      // Check that no .gitkeep files remain
      const files = tree.listChanges();
      const gitkeepFiles = files.filter(file => file.path.endsWith('.gitkeep'));
      
      expect(gitkeepFiles.length).toBe(0);
      expect(tree.exists(`${targetDir}/test.astro`)).toBe(true);
    });

    it('should handle root-level directories', () => {
      const rootDir = 'tools';
      ensureDir(tree, rootDir);
      
      const testFile = `${rootDir}/config.json`;
      expect(() => {
        tree.write(testFile, '{}');
      }).not.toThrow();
      
      expect(tree.exists(testFile)).toBe(true);
    });

    it('should handle empty directory paths gracefully', () => {
      expect(() => {
        ensureDir(tree, '');
      }).not.toThrow();
    });
  });

  describe('safeWriteFile', () => {
    it('should write files successfully when they do not exist', () => {
      const filePath = 'apps/test/src/components/Button.astro';
      const content = '// Button component';
      
      expect(() => {
        safeWriteFile(tree, filePath, content);
      }).not.toThrow();
      
      expect(tree.exists(filePath)).toBe(true);
      expect(tree.read(filePath)?.toString()).toBe(content);
    });

    it('should create parent directories automatically', () => {
      const filePath = 'apps/new-project/src/deeply/nested/path/component.astro';
      const content = '// Deep component';
      
      expect(() => {
        safeWriteFile(tree, filePath, content);
      }).not.toThrow();
      
      expect(tree.exists(filePath)).toBe(true);
      expect(tree.exists('apps/new-project/src/deeply/nested/path')).toBe(true);
    });

    it('should throw when target exists and overwrite is false (default)', () => {
      const filePath = 'apps/test/existing.astro';
      const originalContent = '// Original content';
      const newContent = '// New content';
      
      // Write original file
      tree.write(filePath, originalContent);
      expect(tree.exists(filePath)).toBe(true);
      
      // Should throw when trying to overwrite without permission
      expect(() => {
        safeWriteFile(tree, filePath, newContent);
      }).toThrow('File "apps/test/existing.astro" already exists. Use overwrite: true to replace it.');
      
      // Original content should remain unchanged
      expect(tree.read(filePath)?.toString()).toBe(originalContent);
    });

    it('should throw when target exists and overwrite is explicitly false', () => {
      const filePath = 'apps/test/existing.astro';
      const originalContent = '// Original content';
      const newContent = '// New content';
      
      tree.write(filePath, originalContent);
      
      expect(() => {
        safeWriteFile(tree, filePath, newContent, { overwrite: false });
      }).toThrow('File "apps/test/existing.astro" already exists. Use overwrite: true to replace it.');
    });

    it('should overwrite when target exists and overwrite is true', () => {
      const filePath = 'apps/test/existing.astro';
      const originalContent = '// Original content';
      const newContent = '// New content';
      
      tree.write(filePath, originalContent);
      expect(tree.read(filePath)?.toString()).toBe(originalContent);
      
      expect(() => {
        safeWriteFile(tree, filePath, newContent, { overwrite: true });
      }).not.toThrow();
      
      expect(tree.read(filePath)?.toString()).toBe(newContent);
    });

    it('should handle files in root directory', () => {
      const filePath = 'README.md';
      const content = '# My Project';
      
      expect(() => {
        safeWriteFile(tree, filePath, content);
      }).not.toThrow();
      
      expect(tree.exists(filePath)).toBe(true);
    });

    it('should be deterministic and testable with overwrite behavior', () => {
      const filePath = 'test/deterministic.txt';
      const content1 = 'First content';
      const content2 = 'Second content';
      
      // First write should succeed
      safeWriteFile(tree, filePath, content1);
      expect(readText(tree, filePath)).toBe(content1);
      
      // Second write without overwrite should fail predictably
      expect(() => safeWriteFile(tree, filePath, content2)).toThrow();
      expect(readText(tree, filePath)).toBe(content1); // Should remain unchanged
      
      // Third write with overwrite should succeed predictably
      safeWriteFile(tree, filePath, content2, { overwrite: true });
      expect(readText(tree, filePath)).toBe(content2);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing files', () => {
      const filePath = 'apps/test/existing.astro';
      tree.write(filePath, '// Content');
      
      expect(fileExists(tree, filePath)).toBe(true);
    });

    it('should return false for non-existing files', () => {
      expect(fileExists(tree, 'non/existing/file.astro')).toBe(false);
    });

    it('should return true for existing directories with files', () => {
      const dirPath = 'apps/test';
      tree.write(`${dirPath}/file.astro`, '// Content');
      
      expect(fileExists(tree, dirPath)).toBe(true);
    });

    it('should return false for empty directory paths', () => {
      expect(fileExists(tree, 'apps/empty')).toBe(false);
    });
  });

  describe('readText', () => {
    it('should read text content from existing files', () => {
      const filePath = 'apps/test/component.astro';
      const content = '// Test component\nexport const name = "test";';
      
      tree.write(filePath, content);
      
      expect(readText(tree, filePath)).toBe(content);
    });

    it('should throw error when file does not exist', () => {
      expect(() => {
        readText(tree, 'non/existing/file.astro');
      }).toThrow('File "non/existing/file.astro" does not exist');
    });

    it('should handle UTF-8 content correctly', () => {
      const filePath = 'test/unicode.txt';
      const content = 'Hello 世界 🌍 café';
      
      tree.write(filePath, content);
      
      expect(readText(tree, filePath)).toBe(content);
    });

    it('should handle empty files', () => {
      const filePath = 'test/empty.txt';
      tree.write(filePath, '');
      
      expect(readText(tree, filePath)).toBe('');
    });
  });

  describe('writeText', () => {
    it('should write text content to new files', () => {
      const filePath = 'apps/test/new.astro';
      const content = '// New component';
      
      writeText(tree, filePath, content);
      
      expect(tree.exists(filePath)).toBe(true);
      expect(readText(tree, filePath)).toBe(content);
    });

    it('should overwrite existing files by default', () => {
      const filePath = 'apps/test/existing.astro';
      const originalContent = '// Original';
      const newContent = '// Updated';
      
      tree.write(filePath, originalContent);
      expect(readText(tree, filePath)).toBe(originalContent);
      
      writeText(tree, filePath, newContent);
      expect(readText(tree, filePath)).toBe(newContent);
    });

    it('should create parent directories automatically', () => {
      const filePath = 'deeply/nested/path/file.txt';
      const content = 'Content';
      
      writeText(tree, filePath, content);
      
      expect(tree.exists(filePath)).toBe(true);
      expect(readText(tree, filePath)).toBe(content);
    });
  });

  describe('integration scenarios', () => {
    it('should support complete workflow for generator usage', () => {
      const projectRoot = 'apps/generated-app';
      const componentsDir = `${projectRoot}/src/components`;
      
      // 1. Ensure directory structure exists
      ensureDir(tree, componentsDir);
      
      // 2. Safely write component files
      const buttonPath = `${componentsDir}/Button.astro`;
      const modalPath = `${componentsDir}/Modal.astro`;
      
      safeWriteFile(tree, buttonPath, '// Button component');
      safeWriteFile(tree, modalPath, '// Modal component');
      
      // 3. Verify files exist
      expect(fileExists(tree, buttonPath)).toBe(true);
      expect(fileExists(tree, modalPath)).toBe(true);
      
      // 4. Read and verify content
      expect(readText(tree, buttonPath)).toBe('// Button component');
      expect(readText(tree, modalPath)).toBe('// Modal component');
      
      // 5. Update content using writeText
      writeText(tree, buttonPath, '// Updated Button component');
      expect(readText(tree, buttonPath)).toBe('// Updated Button component');
      
      // 6. Attempt to overwrite without permission should fail
      expect(() => {
        safeWriteFile(tree, modalPath, '// New modal');
      }).toThrow();
      
      // 7. Overwrite with permission should succeed
      safeWriteFile(tree, modalPath, '// New modal', { overwrite: true });
      expect(readText(tree, modalPath)).toBe('// New modal');
    });

    it('should handle edge cases in nested directory creation', () => {
      // Test various edge cases that generators might encounter
      const paths = [
        'single',
        'two/levels',
        'three/deep/levels',
        'apps/project/src/components/ui/forms/inputs',
      ];
      
      paths.forEach(path => {
        expect(() => {
          ensureDir(tree, path);
          safeWriteFile(tree, `${path}/test.txt`, `Content for ${path}`);
        }).not.toThrow();
        
        expect(fileExists(tree, `${path}/test.txt`)).toBe(true);
      });
    });
  });
});
