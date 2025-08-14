import { type Tree, getProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import componentGenerator from './component/generator';
import pageGenerator from './page/generator';
import contentFileGenerator from './content-file/generator';
import astroFileGenerator from './astro-file/generator';
import type { ComponentGeneratorSchema } from './component/generator';
import type { PageGeneratorSchema } from './page/generator';
import type { ContentFileGeneratorSchema } from './content-file/generator';
import type { AstroFileGeneratorSchema } from './astro-file/generator';

// Import internal utilities for testing
import { ensureTreeDirs } from '../internal/fs/tree-io';
import { parseProps, formatPropsInterface, extractPropsFromInterface } from '../internal/generate/props';
import { generatePath, normalizeFileName } from '../internal/generate/pathing';

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

// Mock internal modules with configurable responses
const mockConfig = {
  integrations: [] as string[],
  contentCollections: [] as string[],
  defaultExtension: '.md' as string,
  projectType: 'astro-content' as string,
};

vi.mock('../internal/detect/config', () => ({
  readAstroConfig: vi.fn(() => ({ 
    integrations: mockConfig.integrations, 
    contentDir: 'src/content',
    publicDir: 'public',
    outDir: 'dist'
  })),
  hasContentCollections: vi.fn(() => mockConfig.contentCollections.length > 0),
  getContentCollections: vi.fn(() => mockConfig.contentCollections),
  readIntegrations: vi.fn(() => mockConfig.integrations),
  findAstroConfig: vi.fn(() => 'astro.config.mjs'),
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: vi.fn(() => mockConfig.defaultExtension),
  detectProjectType: vi.fn(() => mockConfig.projectType),
  hasIntegration: vi.fn((integration: string) => mockConfig.integrations.includes(integration)),
}));

// Mock Nx devkit functions
vi.mock('@nx/devkit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();
  
  return {
    ...actual,
    getProjectConfiguration: vi.fn((tree: Tree, projectName: string) => {
      // Look for the project.json file to get project configuration
      const projectJsonPath = `apps/${projectName}/project.json`;
      if (tree.exists(projectJsonPath)) {
        const projectJson = JSON.parse(tree.read(projectJsonPath, 'utf-8')!);
        return {
          name: projectName,
          root: projectJson.root || `apps/${projectName}`,
          sourceRoot: projectJson.sourceRoot || `apps/${projectName}/src`,
          projectType: projectJson.projectType || 'application',
        };
      }
      
      // Fallback configuration
      return {
        name: projectName,
        root: `apps/${projectName}`,
        sourceRoot: `apps/${projectName}/src`,
        projectType: 'application',
      };
    }),
  };
});

describe('Utilities Integration Tests', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    setupMockWorkspace(tree);
    
    // Reset mock config
    mockConfig.integrations = [];
    mockConfig.contentCollections = [];
    mockConfig.defaultExtension = '.md';
    mockConfig.projectType = 'astro-content';
    
    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('File System Utilities', () => {
    test('should create nested directory structures correctly', async () => {
      const deepPath = 'apps/test-app/src/components/ui/forms/inputs/advanced';
      
      ensureTreeDirs(tree, deepPath);
      
      // Test by creating a component in the deep structure
      const options: ComponentGeneratorSchema = {
        name: 'AdvancedInput',
        project: 'test-app',
        directory: 'ui/forms/inputs/advanced',
        skipFormat: true,
      };

      await componentGenerator(tree, options);
      
      expect(tree.exists(`${deepPath}/AdvancedInput.astro`)).toBe(true);
      
      // Verify all intermediate directories exist
      const pathParts = deepPath.split('/');
      let currentPath = '';
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        expect(tree.exists(currentPath)).toBe(true);
      }
    });

    test('should handle directory creation for content collections with deep nesting', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'nested-article',
        project: 'test-app',
        collection: 'blog/categories/tech/frameworks',
        title: 'Deep Nested Article',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/blog/categories/tech/frameworks/nested-article.md')).toBe(true);
      
      // Verify nested collection structure
      expect(tree.exists('apps/test-app/src/content/blog')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/blog/categories')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/blog/categories/tech')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/blog/categories/tech/frameworks')).toBe(true);
    });
  });

  describe('Props Parsing and Generation', () => {
    test('should handle complex TypeScript prop interfaces', async () => {
      const complexProps = 'user: { id: number; name: string; profile: { avatar: string; bio?: string } }, settings: { theme: "light" | "dark"; notifications: boolean }, onUpdate: (user: User) => void';
      
      const options: ComponentGeneratorSchema = {
        name: 'ComplexPropsComponent',
        project: 'test-app',
        props: complexProps,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      // Component generator uses kebab-case for filenames
      const filePath = 'apps/test-app/src/components/complex-props-component.astro';
      const content = tree.read(filePath, 'utf-8');
      
      expect(content).toContain('interface Props');
      expect(content).toContain('user: { id: number; name: string; profile: { avatar: string; bio?: string } }');
      expect(content).toContain('settings: { theme: "light" | "dark"; notifications: boolean }');
      expect(content).toContain('onUpdate: (user: User) => void');
      expect(content).toContain('const { user, settings, onUpdate } = Astro.props');
    });

    test('should handle array and generic types in props', async () => {
      const arrayProps = 'items: Array<{ id: string; title: string }>, filters: string[], onSelect: (item: T) => Promise<void>';
      
      const options: ComponentGeneratorSchema = {
        name: 'ArrayPropsComponent',
        project: 'test-app',
        props: arrayProps,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read('apps/test-app/src/components/array-props-component.astro', 'utf-8');
      
      expect(content).toContain('items: Array<{ id: string; title: string }>');
      expect(content).toContain('filters: string[]');
      expect(content).toContain('onSelect: (item: T) => Promise<void>');
    });

    test('should handle optional props correctly', async () => {
      const optionalProps = 'title: string, subtitle?: string, description?: string, required: boolean';
      
      const options: ComponentGeneratorSchema = {
        name: 'OptionalPropsComponent',
        project: 'test-app',
        props: optionalProps,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read('apps/test-app/src/components/optional-props-component.astro', 'utf-8');
      
      expect(content).toContain('title: string');
      expect(content).toContain('subtitle?: string');
      expect(content).toContain('description?: string');
      expect(content).toContain('required: boolean');
      expect(content).toContain('const { title, subtitle, description, required } = Astro.props');
    });
    
  });

  describe('Path Generation and Normalization', () => {
    test('should normalize various file name formats consistently', async () => {
      const testCases = [
        { input: 'MyComponent', expected: 'my-component' },
        { input: 'my-component', expected: 'my-component' },
        { input: 'My_Component', expected: 'my-component' },
        { input: 'MyAwesome Component', expected: 'my-awesome-component' },
        { input: 'XMLHttpRequest', expected: 'xml-http-request' },
      ];

      for (const testCase of testCases) {
        const options: ComponentGeneratorSchema = {
          name: testCase.input,
          project: 'test-app',
          skipFormat: true,
        };

        await componentGenerator(tree, options);

        const expectedPath = `apps/test-app/src/components/${testCase.expected}.astro`;
        expect(tree.exists(expectedPath), 
          `Expected component with name "${testCase.input}" to create file "${expectedPath}"`
        ).toBe(true);
      }
    });

    test('should handle file names with nested paths in the name', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'ui/Button',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      // Should create nested structure based on the name
      expect(tree.exists('apps/test-app/src/components/ui/Button.astro')).toBe(true);
    });

    test('should combine directory option with nested names correctly', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'forms/InputField',
        project: 'test-app',
        directory: 'ui',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/components/ui/forms/InputField.astro')).toBe(true);
    });
  });

  describe('Project Type Detection and Extension Selection', () => {
    test('should detect MDX support and use appropriate extension', async () => {
      // Setup project with MDX integration
      mockConfig.integrations = ['@astrojs/mdx'];
      mockConfig.defaultExtension = '.mdx';
      mockConfig.projectType = 'astro-mdx';

      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/mdx': '^1.0.0',
          },
        })
      );

      const options: ContentFileGeneratorSchema = {
        name: 'mdx-content',
        project: 'test-app',
        collection: 'posts',
        title: 'MDX Content Test',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/posts/mdx-content.mdx')).toBe(true);
      
      const content = tree.read('apps/test-app/src/content/posts/mdx-content.mdx', 'utf-8');
      expect(content).toContain('# MDX Content Test');
      expect(content).toContain('You can use JSX components');
    });

    test('should detect Markdoc support and use appropriate extension', async () => {
      mockConfig.integrations = ['@astrojs/markdoc'];
      mockConfig.defaultExtension = '.mdoc';
      mockConfig.projectType = 'astro-markdoc';

      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/markdoc': '^1.0.0',
          },
        })
      );

      const options: ContentFileGeneratorSchema = {
        name: 'markdoc-content',
        project: 'test-app',
        collection: 'docs',
        title: 'Markdoc Content Test',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/docs/markdoc-content.mdoc')).toBe(true);
      
      const content = tree.read('apps/test-app/src/content/docs/markdoc-content.mdoc', 'utf-8');
      expect(content).toContain('# Markdoc Content Test');
      expect(content).toContain('Markdoc tags and components');
    });

    test('should detect AsciiDoc support and use appropriate extension', async () => {
      mockConfig.integrations = ['astro-asciidoc'];
      mockConfig.defaultExtension = '.adoc';
      mockConfig.projectType = 'astro-asciidoc';

      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            'astro-asciidoc': '^1.0.0',
          },
        })
      );

      const options: ContentFileGeneratorSchema = {
        name: 'asciidoc-content',
        project: 'test-app',
        collection: 'documentation',
        title: 'AsciiDoc Content Test',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/documentation/asciidoc-content.adoc')).toBe(true);
      
      const content = tree.read('apps/test-app/src/content/documentation/asciidoc-content.adoc', 'utf-8');
      expect(content).toContain('= AsciiDoc Content Test');
      expect(content).toContain('AsciiDoc content');
    });

    test('should fall back to markdown when no content integrations are detected', async () => {
      // No integrations configured
      mockConfig.integrations = [];
      mockConfig.defaultExtension = '.md';
      mockConfig.projectType = 'astro-content';

      const options: ContentFileGeneratorSchema = {
        name: 'fallback-content',
        project: 'test-app',
        collection: 'posts',
        title: 'Fallback Content Test',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/posts/fallback-content.md')).toBe(true);
      
      const content = tree.read('apps/test-app/src/content/posts/fallback-content.md', 'utf-8');
      expect(content).toContain('# Fallback Content Test');
    });
  });

  describe('Content Collection Integration', () => {
    test('should handle existing content collections correctly', async () => {
      mockConfig.contentCollections = ['blog', 'docs', 'tutorials'];

      // Create content in existing collection
      const options: ContentFileGeneratorSchema = {
        name: 'existing-collection-post',
        project: 'test-app',
        collection: 'blog',
        title: 'Post in Existing Collection',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/blog/existing-collection-post.md')).toBe(true);
    });

    test('should create new content collections when needed', async () => {
      mockConfig.contentCollections = ['blog']; // Only one existing collection

      const options: ContentFileGeneratorSchema = {
        name: 'new-collection-post',
        project: 'test-app',
        collection: 'tutorials', // New collection
        title: 'Post in New Collection',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/tutorials/new-collection-post.md')).toBe(true);
    });
  });

  describe('Unified Generator Delegation', () => {
    test('should correctly delegate to component generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'DelegatedComponent',
        project: 'test-app',
        kind: 'component',
        props: 'title:string,active:boolean',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/components/DelegatedComponent.astro')).toBe(true);
      
      const content = tree.read('apps/test-app/src/components/DelegatedComponent.astro', 'utf-8');
      expect(content).toContain('DelegatedComponent');
      expect(content).toContain('interface Props');
      expect(content).toContain('title: string');
      expect(content).toContain('active: boolean');
    });

    test('should correctly delegate to page generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'delegated-page',
        project: 'test-app',
        kind: 'page',
        directory: 'admin',
        ext: 'astro',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/pages/admin/delegated-page.astro')).toBe(true);
      
      const content = tree.read('apps/test-app/src/pages/admin/delegated-page.astro', 'utf-8');
      expect(content).toContain('Delegated Page');
    });

    test('should handle file generation with custom destination', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'custom-file',
        project: 'test-app',
        kind: 'file',
        destination: 'layouts',
        ext: 'astro',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/layouts/custom-file.astro')).toBe(true);
      
      const content = tree.read('apps/test-app/src/layouts/custom-file.astro', 'utf-8');
      expect(content).toContain('Custom File');
    });
  });

  describe('Error Handling and Validation', () => {
    test('should validate required fields across all generators', async () => {
      // Test missing name
      const missingNameOptions: ComponentGeneratorSchema = {
        name: '',
        project: 'test-app',
        skipFormat: true,
      };

      await expect(componentGenerator(tree, missingNameOptions)).rejects.toThrow();

      // Test missing project
      const missingProjectOptions: PageGeneratorSchema = {
        name: 'test-page',
        project: '',
        skipFormat: true,
      };

      await expect(pageGenerator(tree, missingProjectOptions)).rejects.toThrow();
    });

    test('should validate file name patterns', async () => {
      const invalidNameOptions: ComponentGeneratorSchema = {
        name: 'invalid-name-with-!@#',
        project: 'test-app',
        skipFormat: true,
      };

      await expect(componentGenerator(tree, invalidNameOptions)).rejects.toThrow();
    });

    test('should validate props syntax', async () => {
      const invalidPropsOptions: ComponentGeneratorSchema = {
        name: 'test-component',
        project: 'test-app',
        props: 'invalid-props-syntax:::',
        skipFormat: true,
      };

      // This should either throw or sanitize the props
      await expect(componentGenerator(tree, invalidPropsOptions)).rejects.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      // Generate multiple projects
      setupAdditionalProject(tree, 'project-1');
      setupAdditionalProject(tree, 'project-2');
      setupAdditionalProject(tree, 'project-3');

      const bulkOptions: AstroFileGeneratorSchema = {
        name: 'SharedComponent',
        kind: 'component',
        bulk: true,
        projects: ['test-app', 'project-1', 'project-2', 'project-3'],
        props: 'data:any',
        skipFormat: true,
      };

      await astroFileGenerator(tree, bulkOptions);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verify all files were created
      for (const project of bulkOptions.projects!) {
        expect(tree.exists(`apps/${project}/src/components/SharedComponent.astro`)).toBe(true);
      }

      // Performance should be reasonable (less than 5 seconds for 4 projects)
      expect(executionTime).toBeLessThan(5000);
    });

    test('should handle deep directory structures without performance degradation', async () => {
      const deepStructure = 'level1/level2/level3/level4/level5/level6/level7/level8';
      
      const startTime = Date.now();

      const options: ComponentGeneratorSchema = {
        name: 'DeepComponent',
        project: 'test-app',
        directory: deepStructure,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(tree.exists(`apps/test-app/src/components/${deepStructure}/DeepComponent.astro`)).toBe(true);
      
      // Should complete in reasonable time (less than 2 seconds)
      expect(executionTime).toBeLessThan(2000);
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

function setupAdditionalProject(tree: Tree, projectName: string): void {
  setupProject(tree, projectName);
}
