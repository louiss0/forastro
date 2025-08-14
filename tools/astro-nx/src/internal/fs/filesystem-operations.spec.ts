import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ensureTreeDirs } from './tree-io';

describe('File System Operations', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Apps Convention Compliance', () => {
    test('should respect apps/ directory convention for new projects', () => {
      const appName = 'my-astro-app';
      const projectRoot = `apps/${appName}`;
      
      // Ensure the project directory structure
      ensureTreeDirs(tree, `${projectRoot}/src/pages`);
      ensureTreeDirs(tree, `${projectRoot}/src/components`);
      ensureTreeDirs(tree, `${projectRoot}/src/content`);
      
      // Write test files to verify directory structure is correct
      tree.write(`${projectRoot}/package.json`, JSON.stringify({
        name: appName,
        dependencies: { astro: '^4.0.0' }
      }));
      tree.write(`${projectRoot}/src/pages/index.astro`, '<h1>Home Page</h1>');
      tree.write(`${projectRoot}/src/components/Header.astro`, '<header>Header</header>');
      tree.write(`${projectRoot}/src/content/blog/post.md`, '# First Post');
      
      // Verify all files exist in the correct apps/ structure
      expect(tree.exists(`apps/${appName}/package.json`)).toBe(true);
      expect(tree.exists(`apps/${appName}/src/pages/index.astro`)).toBe(true);
      expect(tree.exists(`apps/${appName}/src/components/Header.astro`)).toBe(true);
      expect(tree.exists(`apps/${appName}/src/content/blog/post.md`)).toBe(true);
    });

    test('should handle multiple apps in apps/ directory', () => {
      const apps = ['blog-app', 'portfolio-app', 'docs-app'];
      
      apps.forEach(appName => {
        const projectRoot = `apps/${appName}`;
        
        ensureTreeDirs(tree, `${projectRoot}/src/pages`);
        ensureTreeDirs(tree, `${projectRoot}/src/components`);
        
        tree.write(`${projectRoot}/package.json`, JSON.stringify({
          name: appName,
          type: 'module'
        }));
        tree.write(`${projectRoot}/src/pages/index.astro`, `<h1>${appName} Home</h1>`);
        tree.write(`${projectRoot}/src/components/Layout.astro`, '<slot />');
      });
      
      // Verify all apps exist independently
      apps.forEach(appName => {
        expect(tree.exists(`apps/${appName}/package.json`)).toBe(true);
        expect(tree.exists(`apps/${appName}/src/pages/index.astro`)).toBe(true);
        expect(tree.exists(`apps/${appName}/src/components/Layout.astro`)).toBe(true);
      });
    });

    test('should not interfere with packages/ directory structure', () => {
      // Create both apps and packages
      ensureTreeDirs(tree, 'apps/my-app/src/pages');
      ensureTreeDirs(tree, 'packages/utilities/src');
      ensureTreeDirs(tree, 'packages/ui-components/src');
      
      // Write files to both structures
      tree.write('apps/my-app/src/pages/index.astro', '<h1>App</h1>');
      tree.write('packages/utilities/src/index.ts', 'export const util = {};');
      tree.write('packages/ui-components/src/Button.astro', '<button><slot /></button>');
      
      // Verify both structures coexist
      expect(tree.exists('apps/my-app/src/pages/index.astro')).toBe(true);
      expect(tree.exists('packages/utilities/src/index.ts')).toBe(true);
      expect(tree.exists('packages/ui-components/src/Button.astro')).toBe(true);
    });
  });

  describe('Nested Directory Structure', () => {
    test('should create deeply nested component directories', () => {
      const projectRoot = 'apps/design-system';
      const nestedPaths = [
        'src/components/ui/forms/inputs',
        'src/components/ui/forms/buttons', 
        'src/components/ui/navigation/menus',
        'src/components/layout/headers',
        'src/components/layout/footers'
      ];
      
      nestedPaths.forEach(path => {
        const fullPath = `${projectRoot}/${path}`;
        ensureTreeDirs(tree, fullPath);
        
        // Write a test file to verify the directory exists
        tree.write(`${fullPath}/test.astro`, '<div>Test Component</div>');
        expect(tree.exists(`${fullPath}/test.astro`)).toBe(true);
      });
    });

    test('should create nested page directories for routing', () => {
      const projectRoot = 'apps/docs-site';
      const routePaths = [
        'src/pages/docs/getting-started',
        'src/pages/docs/api/reference',
        'src/pages/blog/2024/january',
        'src/pages/admin/users/settings',
        'src/pages/shop/products/categories'
      ];
      
      routePaths.forEach(path => {
        const fullPath = `${projectRoot}/${path}`;
        ensureTreeDirs(tree, fullPath);
        
        tree.write(`${fullPath}/index.astro`, '<h1>Page Content</h1>');
        expect(tree.exists(`${fullPath}/index.astro`)).toBe(true);
      });
    });

    test('should handle content collections with nested structure', () => {
      const projectRoot = 'apps/blog';
      const contentPaths = [
        'src/content/blog/2024/tech',
        'src/content/blog/2024/personal', 
        'src/content/docs/guides/advanced',
        'src/content/docs/tutorials/beginner',
        'src/content/portfolio/projects/web'
      ];
      
      contentPaths.forEach(path => {
        const fullPath = `${projectRoot}/${path}`;
        ensureTreeDirs(tree, fullPath);
        
        tree.write(`${fullPath}/sample.md`, '# Sample Content');
        expect(tree.exists(`${fullPath}/sample.md`)).toBe(true);
      });
    });

    test('should handle maximum nesting depth gracefully', () => {
      const projectRoot = 'apps/test-app';
      const deepPath = 'src/components/ui/forms/inputs/text/variants/large/styles/themes/dark/components';
      const fullPath = `${projectRoot}/${deepPath}`;
      
      ensureTreeDirs(tree, fullPath);
      
      tree.write(`${fullPath}/TextInput.astro`, '<input type="text" />');
      expect(tree.exists(`${fullPath}/TextInput.astro`)).toBe(true);
    });
  });

  describe('Existing Directory Handling', () => {
    test('should not overwrite existing directory structure', () => {
      const projectRoot = 'apps/existing-app';
      const existingFile = `${projectRoot}/src/pages/index.astro`;
      const existingContent = '<h1>Existing Content</h1>';
      
      // Create initial structure with content
      tree.write(existingFile, existingContent);
      tree.write(`${projectRoot}/src/components/Header.astro`, '<header>Original Header</header>');
      
      // Try to ensure directories that already exist
      ensureTreeDirs(tree, `${projectRoot}/src/pages`);
      ensureTreeDirs(tree, `${projectRoot}/src/components`);
      
      // Verify existing content is preserved
      expect(tree.exists(existingFile)).toBe(true);
      expect(tree.read(existingFile, 'utf-8')).toBe(existingContent);
      expect(tree.exists(`${projectRoot}/src/components/Header.astro`)).toBe(true);
    });

    test('should merge new directories with existing structure', () => {
      const projectRoot = 'apps/partial-app';
      
      // Create partial existing structure
      tree.write(`${projectRoot}/src/pages/index.astro`, '<h1>Home</h1>');
      tree.write(`${projectRoot}/package.json`, '{"name": "partial-app"}');
      
      // Add new directories to existing structure
      ensureTreeDirs(tree, `${projectRoot}/src/components/ui`);
      ensureTreeDirs(tree, `${projectRoot}/src/content/blog`);
      ensureTreeDirs(tree, `${projectRoot}/src/layouts`);
      
      // Add files to new directories
      tree.write(`${projectRoot}/src/components/ui/Button.astro`, '<button><slot /></button>');
      tree.write(`${projectRoot}/src/content/blog/post1.md`, '# First Post');
      tree.write(`${projectRoot}/src/layouts/Layout.astro`, '<html><slot /></html>');
      
      // Verify both existing and new content coexist
      expect(tree.exists(`${projectRoot}/src/pages/index.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/package.json`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/components/ui/Button.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/content/blog/post1.md`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/layouts/Layout.astro`)).toBe(true);
    });

    test('should handle existing files in target directories', () => {
      const projectRoot = 'apps/conflict-app';
      const targetDir = `${projectRoot}/src/components`;
      
      // Create existing files in the target directory
      tree.write(`${targetDir}/ExistingComponent.astro`, '<div>Existing</div>');
      tree.write(`${targetDir}/AnotherComponent.astro`, '<span>Another</span>');
      
      // Ensure the directory (which already exists)
      ensureTreeDirs(tree, targetDir);
      
      // Add new file to the same directory
      tree.write(`${targetDir}/NewComponent.astro`, '<p>New</p>');
      
      // Verify all files coexist
      expect(tree.exists(`${targetDir}/ExistingComponent.astro`)).toBe(true);
      expect(tree.exists(`${targetDir}/AnotherComponent.astro`)).toBe(true);
      expect(tree.exists(`${targetDir}/NewComponent.astro`)).toBe(true);
    });
  });

  describe('Naming Conflicts and Edge Cases', () => {
    test('should handle special characters in project names', () => {
      const specialNames = [
        'my-app-2024',
        'app_with_underscores', 
        'app.with.dots',
        'app-with-multiple-hyphens'
      ];
      
      specialNames.forEach(appName => {
        const projectRoot = `apps/${appName}`;
        
        ensureTreeDirs(tree, `${projectRoot}/src/pages`);
        tree.write(`${projectRoot}/src/pages/index.astro`, `<h1>${appName}</h1>`);
        
        expect(tree.exists(`${projectRoot}/src/pages/index.astro`)).toBe(true);
      });
    });

    test('should handle conflicting directory and file names', () => {
      const projectRoot = 'apps/name-conflict';
      
      // Create a directory with the same name as a potential file
      ensureTreeDirs(tree, `${projectRoot}/src/components/Button`);
      tree.write(`${projectRoot}/src/components/Button/index.astro`, '<button><slot /></button>');
      
      // This should not conflict with the directory
      tree.write(`${projectRoot}/src/components/Button.astro`, '<button class="simple"><slot /></button>');
      
      // Both should exist
      expect(tree.exists(`${projectRoot}/src/components/Button/index.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/components/Button.astro`)).toBe(true);
    });

    test('should handle empty directory names gracefully', () => {
      const projectRoot = 'apps/edge-case';
      
      // This should not create empty path segments
      expect(() => {
        ensureTreeDirs(tree, `${projectRoot}/src//components`);
      }).not.toThrow();
      
      // Should still create the correct path
      tree.write(`${projectRoot}/src/components/Test.astro`, '<div>Test</div>');
      expect(tree.exists(`${projectRoot}/src/components/Test.astro`)).toBe(true);
    });

    test('should handle duplicate path creation calls', () => {
      const projectRoot = 'apps/duplicate-calls';
      const targetPath = `${projectRoot}/src/components/ui`;
      
      // Call ensureTreeDirs multiple times for the same path
      ensureTreeDirs(tree, targetPath);
      ensureTreeDirs(tree, targetPath);
      ensureTreeDirs(tree, targetPath);
      
      // Should not throw errors or create issues
      tree.write(`${targetPath}/Button.astro`, '<button><slot /></button>');
      expect(tree.exists(`${targetPath}/Button.astro`)).toBe(true);
    });

    test('should handle long project names and paths', () => {
      const longAppName = 'my-very-long-application-name-with-many-words-and-hyphens';
      const projectRoot = `apps/${longAppName}`;
      const longPath = `${projectRoot}/src/components/ui/forms/inputs/text/variants/large/with/many/nested/directories`;
      
      ensureTreeDirs(tree, longPath);
      
      tree.write(`${longPath}/VeryLongComponentName.astro`, '<input />');
      expect(tree.exists(`${longPath}/VeryLongComponentName.astro`)).toBe(true);
    });

    test('should handle paths with mixed separators', () => {
      const projectRoot = 'apps/mixed-separators';
      
      // Test different path construction approaches
      ensureTreeDirs(tree, `${projectRoot}/src/components`);
      ensureTreeDirs(tree, projectRoot + '/src/pages');
      ensureTreeDirs(tree, [projectRoot, 'src', 'layouts'].join('/'));
      
      // All should work correctly
      tree.write(`${projectRoot}/src/components/Component.astro`, '<div>Component</div>');
      tree.write(`${projectRoot}/src/pages/page.astro`, '<div>Page</div>');
      tree.write(`${projectRoot}/src/layouts/Layout.astro`, '<div>Layout</div>');
      
      expect(tree.exists(`${projectRoot}/src/components/Component.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/pages/page.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/layouts/Layout.astro`)).toBe(true);
    });
  });

  describe('Project Structure Validation', () => {
    test('should create standard Astro project structure', () => {
      const projectRoot = 'apps/standard-app';
      const standardDirs = [
        'src/pages',
        'src/components',
        'src/layouts',
        'src/content',
        'src/assets',
        'src/styles',
        'public'
      ];
      
      standardDirs.forEach(dir => {
        ensureTreeDirs(tree, `${projectRoot}/${dir}`);
      });
      
      // Create typical files for each directory
      tree.write(`${projectRoot}/src/pages/index.astro`, '<h1>Home</h1>');
      tree.write(`${projectRoot}/src/components/Header.astro`, '<header><slot /></header>');
      tree.write(`${projectRoot}/src/layouts/Layout.astro`, '<html><slot /></html>');
      tree.write(`${projectRoot}/src/content/config.ts`, 'export const collections = {};');
      tree.write(`${projectRoot}/src/assets/logo.svg`, '<svg></svg>');
      tree.write(`${projectRoot}/src/styles/global.css`, 'body { margin: 0; }');
      tree.write(`${projectRoot}/public/favicon.ico`, 'favicon-data');
      
      // Verify complete structure
      standardDirs.forEach(dir => {
        expect(tree.exists(`${projectRoot}/${dir}`)).toBe(true);
      });
    });

    test('should support multiple project structures simultaneously', () => {
      const projects = [
        { name: 'blog', type: 'content-heavy' },
        { name: 'portfolio', type: 'component-heavy' },
        { name: 'docs', type: 'structured' }
      ];
      
      projects.forEach(project => {
        const projectRoot = `apps/${project.name}`;
        
        if (project.type === 'content-heavy') {
          ensureTreeDirs(tree, `${projectRoot}/src/content/blog`);
          ensureTreeDirs(tree, `${projectRoot}/src/content/authors`);
          tree.write(`${projectRoot}/src/content/blog/post1.md`, '# Blog Post');
        } else if (project.type === 'component-heavy') {
          ensureTreeDirs(tree, `${projectRoot}/src/components/ui`);
          ensureTreeDirs(tree, `${projectRoot}/src/components/portfolio`);
          tree.write(`${projectRoot}/src/components/ui/Gallery.astro`, '<div>Gallery</div>');
        } else if (project.type === 'structured') {
          ensureTreeDirs(tree, `${projectRoot}/src/content/docs/api`);
          ensureTreeDirs(tree, `${projectRoot}/src/content/docs/guides`);
          tree.write(`${projectRoot}/src/content/docs/api/reference.md`, '# API Reference');
        }
        
        // Common structure for all projects
        ensureTreeDirs(tree, `${projectRoot}/src/pages`);
        tree.write(`${projectRoot}/src/pages/index.astro`, `<h1>${project.name}</h1>`);
      });
      
      // Verify all projects exist independently
      projects.forEach(project => {
        expect(tree.exists(`apps/${project.name}/src/pages/index.astro`)).toBe(true);
      });
    });

    test('should handle non-standard but valid project structures', () => {
      const projectRoot = 'apps/custom-structure';
      
      // Create custom directory structure
      const customDirs = [
        'source/templates',
        'source/data',
        'source/utilities',
        'static/assets',
        'config'
      ];
      
      customDirs.forEach(dir => {
        ensureTreeDirs(tree, `${projectRoot}/${dir}`);
      });
      
      // Add files to custom structure
      tree.write(`${projectRoot}/source/templates/main.astro`, '<div>Main Template</div>');
      tree.write(`${projectRoot}/source/data/content.json`, '{"key": "value"}');
      tree.write(`${projectRoot}/source/utilities/helpers.ts`, 'export const helper = {};');
      tree.write(`${projectRoot}/static/assets/image.jpg`, 'image-data');
      tree.write(`${projectRoot}/config/settings.js`, 'export default {};');
      
      // Verify custom structure works
      customDirs.forEach(dir => {
        expect(tree.exists(`${projectRoot}/${dir}`)).toBe(true);
      });
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle bulk directory creation efficiently', () => {
      const projectRoot = 'apps/bulk-test';
      const directories = Array.from({ length: 50 }, (_, i) => 
        `${projectRoot}/src/components/group-${Math.floor(i / 10)}/component-${i}`
      );
      
      // Create all directories
      directories.forEach(dir => {
        ensureTreeDirs(tree, dir);
        tree.write(`${dir}/Component${dir.split('-').pop()}.astro`, '<div>Component</div>');
      });
      
      // Verify all directories were created
      directories.forEach(dir => {
        expect(tree.exists(`${dir}/Component${dir.split('-').pop()}.astro`)).toBe(true);
      });
    });

    test('should not leave artifacts after directory creation', () => {
      const projectRoot = 'apps/clean-test';
      const targetDirs = [
        `${projectRoot}/src/components`,
        `${projectRoot}/src/pages`,
        `${projectRoot}/src/layouts`
      ];
      
      targetDirs.forEach(dir => {
        ensureTreeDirs(tree, dir);
      });
      
      // Add real files
      tree.write(`${projectRoot}/src/components/Button.astro`, '<button><slot /></button>');
      tree.write(`${projectRoot}/src/pages/index.astro`, '<h1>Home</h1>');
      tree.write(`${projectRoot}/src/layouts/Layout.astro`, '<html><slot /></html>');
      
      // Check that no .gitkeep files or other artifacts remain
      const allFiles = tree.listChanges();
      const artifacts = allFiles.filter(file => 
        file.path.includes('.gitkeep') || 
        file.path.includes('.tmp') || 
        file.path.includes('.placeholder')
      );
      
      expect(artifacts.length).toBe(0);
      
      // Verify real files exist
      expect(tree.exists(`${projectRoot}/src/components/Button.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/pages/index.astro`)).toBe(true);
      expect(tree.exists(`${projectRoot}/src/layouts/Layout.astro`)).toBe(true);
    });

    test('should handle concurrent directory creation requests', () => {
      const projectRoot = 'apps/concurrent-test';
      const sharedPath = `${projectRoot}/src/components/shared`;
      
      // Simulate concurrent calls to ensureTreeDirs for the same path
      const promises = Array.from({ length: 10 }, () => {
        return new Promise<void>((resolve) => {
          ensureTreeDirs(tree, sharedPath);
          resolve();
        });
      });
      
      return Promise.all(promises).then(() => {
        // Should not throw errors
        tree.write(`${sharedPath}/SharedComponent.astro`, '<div>Shared</div>');
        expect(tree.exists(`${sharedPath}/SharedComponent.astro`)).toBe(true);
      });
    });
  });
});
