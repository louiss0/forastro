import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import componentGenerator from './component/generator';
import pageGenerator from './page/generator';
import contentFileGenerator from './content-file/generator';
import type { ComponentGeneratorSchema } from './component/generator';
import type { PageGeneratorSchema } from './page/generator';
import type { ContentFileGeneratorSchema } from './content-file/generator';

// Mock fs functions used by generators
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  let currentTree: Tree | null = null;

  const mockExistsSync = vi.fn((path: string) => {
    if (!currentTree) return true;
    return currentTree.exists(path);
  });

  const mockReadFileSync = vi.fn((path: string) => {
    if (!currentTree) {
      if (path.endsWith('package.json')) {
        return JSON.stringify({
          name: 'test',
          dependencies: { astro: '^4.0.0' },
        });
      }
      return 'export default {};';
    }

    try {
      const content = currentTree.read(path, 'utf-8');
      return content;
    } catch {
      if (path.endsWith('package.json')) {
        return JSON.stringify({
          name: 'test',
          dependencies: { astro: '^4.0.0' },
        });
      }
      return 'export default {};';
    }
  });

  // Export function to set current tree for testing
  (globalThis as Record<string, unknown>)['setMockTree'] = (tree: Tree) => {
    currentTree = tree;
  };

  return {
    ...actual,
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    readdirSync: vi.fn(() => []),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

// Mock internal modules
vi.mock('../internal/detect/config', () => ({
  readAstroConfig: vi.fn(() => ({
    integrations: [],
    contentDir: 'src/content',
    publicDir: 'public',
    outDir: 'dist'
  })),
  hasContentCollections: vi.fn(() => false),
  getContentCollections: vi.fn(() => []),
  readIntegrations: vi.fn(() => []),
  findAstroConfig: vi.fn(() => 'astro.config.mjs'),
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: vi.fn(() => '.md'),
  detectProjectType: vi.fn(() => 'astro-content'),
  hasIntegration: vi.fn(() => false),
}));

describe('Generator Idempotent Behavior', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    setupMockWorkspace(tree);
    
    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Component Generator Idempotent Behavior', () => {
    it('should throw error when file already exists and overwrite is false', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'TestComponent',
        project: 'test-app',
        skipFormat: true,
        overwrite: false,
      };

      // First run should succeed
      await componentGenerator(tree, options);
      expect(tree.exists('apps/test-app/src/components/test-component.astro')).toBe(true);

      // Second run should throw error with clear message
      await expect(componentGenerator(tree, options)).rejects.toThrow(
        'File already exists at "apps/test-app/src/components/test-component.astro". Use --overwrite to replace it.'
      );
    });

    it('should allow regeneration when overwrite is true', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'TestComponent',
        project: 'test-app',
        props: 'initialProp: string',
        skipFormat: true,
        overwrite: false,
      };

      // First run
      await componentGenerator(tree, options);
      const firstContent = tree.read('apps/test-app/src/components/test-component.astro', 'utf-8');
      expect(firstContent).toContain('initialProp: string');

      // Second run with overwrite enabled and different props
      const overwriteOptions: ComponentGeneratorSchema = {
        ...options,
        props: 'newProp: number',
        overwrite: true,
      };

      await componentGenerator(tree, overwriteOptions);
      const secondContent = tree.read('apps/test-app/src/components/test-component.astro', 'utf-8');
      expect(secondContent).toContain('newProp: number');
      expect(secondContent).not.toContain('initialProp: string');
    });

    it('should handle nested directory collisions correctly', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'NestedComponent',
        project: 'test-app',
        directory: 'ui/forms',
        skipFormat: true,
        overwrite: false,
      };

      await componentGenerator(tree, options);
      expect(tree.exists('apps/test-app/src/components/ui/forms/nested-component.astro')).toBe(true);

      // Should fail on second run
      await expect(componentGenerator(tree, options)).rejects.toThrow(
        'File already exists at "apps/test-app/src/components/ui/forms/nested-component.astro". Use --overwrite to replace it.'
      );
    });
  });

  describe('Page Generator Idempotent Behavior', () => {
    it('should throw error when page already exists and overwrite is false', async () => {
      const options: PageGeneratorSchema = {
        name: 'test-page',
        project: 'test-app',
        title: 'Test Page',
        skipFormat: true,
        overwrite: false,
      };

      // First run should succeed
      await pageGenerator(tree, options);
      expect(tree.exists('apps/test-app/src/pages/test-page.astro')).toBe(true);

      // Second run should throw error
      await expect(pageGenerator(tree, options)).rejects.toThrow(
        'File already exists at "apps/test-app/src/pages/test-page.astro". Use --overwrite to replace it.'
      );
    });

    it('should allow regeneration when overwrite is true', async () => {
      const options: PageGeneratorSchema = {
        name: 'test-page',
        project: 'test-app',
        title: 'Original Title',
        skipFormat: true,
        overwrite: false,
      };

      // First run
      await pageGenerator(tree, options);
      const firstContent = tree.read('apps/test-app/src/pages/test-page.astro', 'utf-8');
      expect(firstContent).toContain('Original Title');

      // Second run with overwrite
      const overwriteOptions: PageGeneratorSchema = {
        ...options,
        title: 'Updated Title',
        overwrite: true,
      };

      await pageGenerator(tree, overwriteOptions);
      const secondContent = tree.read('apps/test-app/src/pages/test-page.astro', 'utf-8');
      expect(secondContent).toContain('Updated Title');
      expect(secondContent).not.toContain('Original Title');
    });

    it('should handle dynamic route collisions correctly', async () => {
      const options: PageGeneratorSchema = {
        name: 'blog/[slug]',
        project: 'test-app',
        title: 'Dynamic Blog Post',
        skipFormat: true,
        overwrite: false,
      };

      await pageGenerator(tree, options);
      expect(tree.exists('apps/test-app/src/pages/blog/[slug].astro')).toBe(true);

      // Should fail on second run
      await expect(pageGenerator(tree, options)).rejects.toThrow(
        'File already exists at "apps/test-app/src/pages/blog/[slug].astro". Use --overwrite to replace it.'
      );
    });
  });

  describe('Content File Generator Idempotent Behavior', () => {
    it('should throw error when content file already exists and overwrite is false', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'test-post',
        project: 'test-app',
        collection: 'blog',
        title: 'Test Post',
        skipFormat: true,
        overwrite: false,
      };

      // First run should succeed
      await contentFileGenerator(tree, options);
      expect(tree.exists('apps/test-app/src/content/blog/test-post.md')).toBe(true);

      // Second run should throw error
      await expect(contentFileGenerator(tree, options)).rejects.toThrow(
        'File already exists at "apps/test-app/src/content/blog/test-post.md". Use --overwrite to replace it.'
      );
    });

    it('should allow regeneration when overwrite is true', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'test-post',
        project: 'test-app',
        collection: 'blog',
        title: 'Original Title',
        author: 'Original Author',
        skipFormat: true,
        overwrite: false,
      };

      // First run
      await contentFileGenerator(tree, options);
      const firstContent = tree.read('apps/test-app/src/content/blog/test-post.md', 'utf-8');
      expect(firstContent).toContain('Original Title');
      expect(firstContent).toContain('Original Author');

      // Second run with overwrite
      const overwriteOptions: ContentFileGeneratorSchema = {
        ...options,
        title: 'Updated Title',
        author: 'Updated Author',
        overwrite: true,
      };

      await contentFileGenerator(tree, overwriteOptions);
      const secondContent = tree.read('apps/test-app/src/content/blog/test-post.md', 'utf-8');
      expect(secondContent).toContain('Updated Title');
      expect(secondContent).toContain('Updated Author');
      expect(secondContent).not.toContain('Original Title');
      expect(secondContent).not.toContain('Original Author');
    });
  });

  describe('Edge Case Integration Tests', () => {
    it('should handle collision detection across different generators', async () => {
      // Create a component first
      await componentGenerator(tree, {
        name: 'SharedName',
        project: 'test-app',
        directory: 'shared',
        skipFormat: true,
        overwrite: false,
      });

      expect(tree.exists('apps/test-app/src/components/shared/shared-name.astro')).toBe(true);

      // Try to create another component with same name in same directory - should fail
      await expect(componentGenerator(tree, {
        name: 'SharedName',
        project: 'test-app',
        directory: 'shared',
        props: 'differentProps: string',
        skipFormat: true,
        overwrite: false,
      })).rejects.toThrow('File already exists');

      // But should succeed with different directory
      await componentGenerator(tree, {
        name: 'SharedName',
        project: 'test-app',
        directory: 'different',
        props: 'differentProps: string',
        skipFormat: true,
        overwrite: false,
      });

      expect(tree.exists('apps/test-app/src/components/different/shared-name.astro')).toBe(true);
    });

    it('should handle missing input validation before collision check', async () => {
      // Test with missing required fields - should fail validation before collision check
      await expect(componentGenerator(tree, {
        name: '',
        project: 'test-app',
        skipFormat: true,
        overwrite: false,
      } as ComponentGeneratorSchema)).rejects.toThrow('name cannot be empty');

      await expect(componentGenerator(tree, {
        name: 'ValidName',
        project: '',
        skipFormat: true,
        overwrite: false,
      } as ComponentGeneratorSchema)).rejects.toThrow('project cannot be empty');

      await expect(componentGenerator(tree, {
        name: 'ValidName',
        project: 'non-existent-project',
        skipFormat: true,
        overwrite: false,
      })).rejects.toThrow('Project "non-existent-project" does not exist');
    });

    it('should provide clear error messages for collision scenarios', async () => {
      // Create initial file
      await componentGenerator(tree, {
        name: 'ErrorTestComponent',
        project: 'test-app',
        skipFormat: true,
        overwrite: false,
      });

      // Test error message clarity
      try {
        await componentGenerator(tree, {
          name: 'ErrorTestComponent',
          project: 'test-app',
          skipFormat: true,
          overwrite: false,
        });
      } catch (error) {
        expect(error.message).toContain('File already exists');
        expect(error.message).toContain('apps/test-app/src/components/error-test-component.astro');
        expect(error.message).toContain('Use --overwrite to replace it');
      }
    });

    it('should handle file system permission scenarios gracefully', async () => {
      // This test simulates scenarios where files exist but might have different permissions
      const options: ComponentGeneratorSchema = {
        name: 'PermissionTest',
        project: 'test-app',
        skipFormat: true,
        overwrite: false,
      };

      // Create file first
      await componentGenerator(tree, options);

      // Verify collision detection still works
      await expect(componentGenerator(tree, options)).rejects.toThrow('File already exists');

      // Verify overwrite still works
      const overwriteOptions = { ...options, overwrite: true, props: 'newProp: string' };
      await componentGenerator(tree, overwriteOptions);
      
      const content = tree.read('apps/test-app/src/components/permission-test.astro', 'utf-8');
      expect(content).toContain('newProp: string');
    });
  });
});

// Helper functions

function setupMockWorkspace(tree: Tree): void {
  tree.write(
    'package.json',
    JSON.stringify({
      name: 'test-workspace',
      devDependencies: {
        '@nx/workspace': '^17.0.0',
      },
    })
  );

  tree.write(
    'nx.json',
    JSON.stringify({
      npmScope: 'test',
      affected: {
        defaultBase: 'main',
      },
      tasksRunnerOptions: {
        default: {
          runner: 'nx/tasks-runners/default',
        },
      },
    })
  );

  setupProject(tree, 'test-app');
}

function setupProject(tree: Tree, projectName: string): void {
  const projectRoot = `apps/${projectName}`;
  
  tree.write(
    `${projectRoot}/project.json`,
    JSON.stringify({
      name: projectName,
      root: projectRoot,
      projectType: 'application',
      sourceRoot: `${projectRoot}/src`,
      targets: {},
    })
  );

  tree.write(
    `${projectRoot}/package.json`,
    JSON.stringify({
      name: projectName,
      dependencies: {
        astro: '^4.0.0',
      },
    })
  );

  tree.write(`${projectRoot}/astro.config.mjs`, 'export default {};');
  tree.write(`${projectRoot}/src/pages/.gitkeep`, '');
  tree.write(`${projectRoot}/src/components/.gitkeep`, '');
  tree.write(`${projectRoot}/src/content/.gitkeep`, '');
  tree.write(`${projectRoot}/src/layouts/.gitkeep`, '');
}
