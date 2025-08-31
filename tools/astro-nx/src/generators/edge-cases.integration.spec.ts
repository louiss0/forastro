import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import componentGenerator from './component/generator';
import pageGenerator from './page/generator';
import contentFileGenerator from './content-file/generator';
import astroFileGenerator from './astro-file/generator';
import type { ComponentGeneratorSchema } from './component/generator';
import type { PageGeneratorSchema } from './page/generator';
import type { ContentFileGeneratorSchema } from './content-file/generator';
import type { AstroFileGeneratorSchema } from './astro-file/generator';

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

// Mock internal modules with enhanced error simulation capabilities
const mockConfig = {
  integrations: [] as string[],
  contentCollections: [] as string[],
  defaultExtension: '.md' as string,
  projectType: 'astro-content' as string,
  shouldThrowError: false,
  errorMessage: '',
};

vi.mock('../internal/detect/config', () => ({
  readAstroConfig: vi.fn(() => {
    if (mockConfig.shouldThrowError) {
      throw new Error(mockConfig.errorMessage || 'Mock config error');
    }
    return { 
      integrations: mockConfig.integrations, 
      contentDir: 'src/content',
      publicDir: 'public',
      outDir: 'dist'
    };
  }),
  hasContentCollections: vi.fn(() => {
    if (mockConfig.shouldThrowError) {
      throw new Error(mockConfig.errorMessage || 'Mock content collections error');
    }
    return mockConfig.contentCollections.length > 0;
  }),
  getContentCollections: vi.fn(() => mockConfig.contentCollections),
  readIntegrations: vi.fn(() => mockConfig.integrations),
  findAstroConfig: vi.fn(() => mockConfig.shouldThrowError ? null : 'astro.config.mjs'),
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: vi.fn(() => mockConfig.defaultExtension),
  detectProjectType: vi.fn(() => mockConfig.projectType),
  hasIntegration: vi.fn((integration: string) => mockConfig.integrations.includes(integration)),
}));

describe('Edge Cases and Complex Integration Scenarios', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    setupMockWorkspace(tree);
    
    // Reset mock config
    mockConfig.integrations = [];
    mockConfig.contentCollections = [];
    mockConfig.defaultExtension = '.md';
    mockConfig.projectType = 'astro-content';
    mockConfig.shouldThrowError = false;
    mockConfig.errorMessage = '';
    
    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple generators running simultaneously', async () => {
      // Create multiple operations that run concurrently
      const operations = [
        componentGenerator(tree, {
          name: 'ConcurrentComponent1',
          project: 'test-app',
          props: 'data1:string',
          skipFormat: true,
        }),
        componentGenerator(tree, {
          name: 'ConcurrentComponent2',
          project: 'test-app',
          props: 'data2:number',
          skipFormat: true,
        }),
        pageGenerator(tree, {
          name: 'concurrent-page1',
          project: 'test-app',
          title: 'Concurrent Page 1',
          skipFormat: true,
        }),
        pageGenerator(tree, {
          name: 'concurrent-page2',
          project: 'test-app',
          title: 'Concurrent Page 2',
          skipFormat: true,
        }),
        contentFileGenerator(tree, {
          name: 'concurrent-content1',
          project: 'test-app',
          collection: 'blog',
          title: 'Concurrent Content 1',
          skipFormat: true,
        }),
        contentFileGenerator(tree, {
          name: 'concurrent-content2',
          project: 'test-app',
          collection: 'docs',
          title: 'Concurrent Content 2',
          skipFormat: true,
        }),
      ];

      // Wait for all operations to complete
      await Promise.all(operations);

      // Verify all files were created correctly
      expect(tree.exists('apps/test-app/src/components/ConcurrentComponent1.astro')).toBe(true);
      expect(tree.exists('apps/test-app/src/components/ConcurrentComponent2.astro')).toBe(true);
      expect(tree.exists('apps/test-app/src/pages/concurrent-page1.astro')).toBe(true);
      expect(tree.exists('apps/test-app/src/pages/concurrent-page2.astro')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/blog/concurrent-content1.md')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/docs/concurrent-content2.md')).toBe(true);

      // Verify content integrity
      const component1 = tree.read('apps/test-app/src/components/ConcurrentComponent1.astro', 'utf-8');
      expect(component1).toContain('ConcurrentComponent1');
      expect(component1).toContain('data1: string');

      const component2 = tree.read('apps/test-app/src/components/ConcurrentComponent2.astro', 'utf-8');
      expect(component2).toContain('ConcurrentComponent2');
      expect(component2).toContain('data2: number');
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle corrupt or missing configuration files gracefully', async () => {
      // Simulate corrupted Astro config
      tree.write('apps/test-app/astro.config.mjs', 'invalid javascript syntax {{{');

      mockConfig.shouldThrowError = true;
      mockConfig.errorMessage = 'Failed to parse Astro config';

      // Generator should still work with fallback behavior
      const options: ComponentGeneratorSchema = {
        name: 'ResilientComponent',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/components/ResilientComponent.astro')).toBe(true);
      
      // Reset error state
      mockConfig.shouldThrowError = false;
    });

    test('should handle missing package.json gracefully', async () => {
      // Remove package.json from project
      tree.delete('apps/test-app/package.json');

      const options: ContentFileGeneratorSchema = {
        name: 'no-package-json-content',
        project: 'test-app',
        collection: 'posts',
        title: 'Content without package.json',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/posts/no-package-json-content.md')).toBe(true);
    });

    test('should handle file permission errors gracefully', async () => {
      // Simulate read-only file system by creating a file first
      const componentPath = 'apps/test-app/src/components/ReadOnlyComponent.astro';
      tree.write(componentPath, '<!-- Read-only content -->');

      const options: ComponentGeneratorSchema = {
        name: 'ReadOnlyComponent',
        project: 'test-app',
        props: 'newProp:string',
        skipFormat: true,
      };

      // Should overwrite the existing file
      await componentGenerator(tree, options);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('ReadOnlyComponent');
      expect(content).toContain('newProp: string');
      expect(content).not.toContain('Read-only content');
    });
  });

  describe('Unicode and Special Characters', () => {
    test('should handle Unicode characters in file names and content', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'UnicodeComponent',
        project: 'test-app',
        props: 'title:string,émoji:string,中文:string',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read('apps/test-app/src/components/UnicodeComponent.astro', 'utf-8');
      expect(content).toContain('émoji: string');
      expect(content).toContain('中文: string');
      expect(content).toContain('const { title, émoji, 中文 } = Astro.props');
    });

    test('should handle special characters in content frontmatter', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'special-chars-post',
        project: 'test-app',
        collection: 'blog',
        title: 'Post with "quotes" and special chars: !@#$%^&*()',
        description: 'Description with émoji 🚀 and symbols',
        author: 'Jöhn Döe',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const content = tree.read('apps/test-app/src/content/blog/special-chars-post.md', 'utf-8');
      expect(content).toContain('title: Post with "quotes" and special chars: !@#$%^&*()');
      expect(content).toContain('description: Description with émoji 🚀 and symbols');
      expect(content).toContain('author: Jöhn Döe');
    });
  });

  describe('Large Scale Operations', () => {
    test('should handle generation of many files without memory issues', async () => {
      const numberOfFiles = 100;
      const operations: Promise<any>[] = [];

      // Generate many components
      for (let i = 0; i < numberOfFiles; i++) {
        operations.push(
          componentGenerator(tree, {
            name: `Component${i}`,
            project: 'test-app',
            props: `prop${i}:string,index:number`,
            directory: `batch${Math.floor(i / 10)}`,
            skipFormat: true,
          })
        );
      }

      await Promise.all(operations);

      // Verify a sampling of files
      const sampleIndices = [0, 25, 50, 75, 99];
      for (const i of sampleIndices) {
        const batchDir = Math.floor(i / 10);
        const filePath = `apps/test-app/src/components/batch${batchDir}/Component${i}.astro`;
        expect(tree.exists(filePath)).toBe(true);
        
        const content = tree.read(filePath, 'utf-8');
        expect(content).toContain(`Component${i}`);
        expect(content).toContain(`prop${i}: string`);
        expect(content).toContain('index: number');
      }
    });

    test('should handle deeply nested directory structures', async () => {
      const maxDepth = 20;
      let directory = '';
      
      // Create a very deep directory structure
      for (let i = 1; i <= maxDepth; i++) {
        directory += directory ? `/level${i}` : `level${i}`;
      }

      const options: ComponentGeneratorSchema = {
        name: 'DeepNestedComponent',
        project: 'test-app',
        directory: directory,
        props: 'depth:number,path:string',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const expectedPath = `apps/test-app/src/components/${directory}/DeepNestedComponent.astro`;
      expect(tree.exists(expectedPath)).toBe(true);

      const content = tree.read(expectedPath, 'utf-8');
      expect(content).toContain('DeepNestedComponent');
      expect(content).toContain('depth: number');
      expect(content).toContain('path: string');
    });
  });

  describe('Complex Props and TypeScript Edge Cases', () => {
    test('should handle extremely complex TypeScript types', async () => {
      const complexProps = `
        genericData: T extends Record<string, any> ? T : never,
        conditionalProp: K extends keyof T ? T[K] : undefined,
        functionProp: <U>(data: U) => Promise<Array<{ id: string; data: U }> | null>,
        tupleType: [string, number, boolean, ...Array<string>],
        mapped: { [P in keyof T]: T[P] extends string ? T[P] : never },
        intersection: { a: string } & { b: number } & { c?: boolean },
        union: string | number | { complex: { nested: { value: boolean } } }
      `.replace(/\s+/g, ' ').trim();

      const options: ComponentGeneratorSchema = {
        name: 'ComplexTypesComponent',
        project: 'test-app',
        props: complexProps,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read('apps/test-app/src/components/ComplexTypesComponent.astro', 'utf-8');
      expect(content).toContain('interface Props');
      expect(content).toContain('T extends Record<string, any>');
      expect(content).toContain('Promise<Array<{ id: string; data: U }> | null>');
      expect(content).toContain('[string, number, boolean, ...Array<string>]');
    });

    test('should handle props with reserved JavaScript keywords', async () => {
      const reservedKeywordProps = 'class:string,for:string,if:boolean,else:string,function:Function,return:any';

      const options: ComponentGeneratorSchema = {
        name: 'ReservedKeywordsComponent',
        project: 'test-app',
        props: reservedKeywordProps,
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read('apps/test-app/src/components/ReservedKeywordsComponent.astro', 'utf-8');
      expect(content).toContain('class: string');
      expect(content).toContain('for: string');
      expect(content).toContain('if: boolean');
      expect(content).toContain('function: Function');
      expect(content).toContain('const { class, for, if, else, function, return } = Astro.props');
    });
  });

  describe('File Extension Edge Cases', () => {
    test('should handle mixed extension environments', async () => {
      // Setup project with multiple content integrations
      mockConfig.integrations = ['@astrojs/mdx', '@astrojs/markdoc', 'astro-asciidoc'];
      
      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/mdx': '^1.0.0',
            '@astrojs/markdoc': '^1.0.0',
            'astro-asciidoc': '^1.0.0',
          },
        })
      );

      // Generate files with explicit extensions
      const mdxOptions: ContentFileGeneratorSchema = {
        name: 'mdx-explicit',
        project: 'test-app',
        collection: 'posts',
        ext: 'mdx',
        title: 'Explicit MDX',
        skipFormat: true,
      };

      const markdocOptions: ContentFileGeneratorSchema = {
        name: 'markdoc-explicit',
        project: 'test-app',
        collection: 'posts',
        ext: 'mdoc',
        title: 'Explicit Markdoc',
        skipFormat: true,
      };

      const asciidocOptions: ContentFileGeneratorSchema = {
        name: 'asciidoc-explicit',
        project: 'test-app',
        collection: 'posts',
        ext: 'adoc',
        title: 'Explicit AsciiDoc',
        skipFormat: true,
      };

      await Promise.all([
        contentFileGenerator(tree, mdxOptions),
        contentFileGenerator(tree, markdocOptions),
        contentFileGenerator(tree, asciidocOptions),
      ]);

      expect(tree.exists('apps/test-app/src/content/posts/mdx-explicit.mdx')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/posts/markdoc-explicit.mdoc')).toBe(true);
      expect(tree.exists('apps/test-app/src/content/posts/asciidoc-explicit.adoc')).toBe(true);

      // Verify content format is correct for each
      const mdxContent = tree.read('apps/test-app/src/content/posts/mdx-explicit.mdx', 'utf-8');
      expect(mdxContent).toContain('# Explicit MDX');
      expect(mdxContent).toContain('JSX components');

      const markdocContent = tree.read('apps/test-app/src/content/posts/markdoc-explicit.mdoc', 'utf-8');
      expect(markdocContent).toContain('# Explicit Markdoc');
      expect(markdocContent).toContain('Markdoc tags');

      const asciidocContent = tree.read('apps/test-app/src/content/posts/asciidoc-explicit.adoc', 'utf-8');
      expect(asciidocContent).toContain('= Explicit AsciiDoc');
      expect(asciidocContent).toContain('AsciiDoc content');
    });
  });

  describe('Workspace Configuration Edge Cases', () => {
    test('should handle missing workspace configuration', async () => {
      // Remove workspace configuration
      tree.delete('nx.json');
      tree.delete('package.json');

      const options: ComponentGeneratorSchema = {
        name: 'NoWorkspaceComponent',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/components/NoWorkspaceComponent.astro')).toBe(true);
    });

    test('should handle malformed project configuration', async () => {
      // Create malformed project.json
      tree.write('apps/test-app/project.json', '{ invalid json');

      const options: PageGeneratorSchema = {
        name: 'malformed-config-page',
        project: 'test-app',
        title: 'Malformed Config Test',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/pages/malformed-config-page.astro')).toBe(true);
    });
  });

  describe('Bulk Operations Edge Cases', () => {
    test('should handle bulk operations with some failing projects', async () => {
      // Setup multiple projects, but make one invalid
      setupAdditionalProject(tree, 'valid-project-1');
      setupAdditionalProject(tree, 'valid-project-2');
      
      // Don't setup 'invalid-project' to simulate missing project
      const bulkOptions: AstroFileGeneratorSchema = {
        name: 'BulkComponent',
        kind: 'component',
        bulk: true,
        projects: ['test-app', 'valid-project-1', 'invalid-project', 'valid-project-2'],
        props: 'data:string',
        skipFormat: true,
      };

      // Should throw due to invalid project
      await expect(astroFileGenerator(tree, bulkOptions)).rejects.toThrow();
    });

    test('should handle empty projects array in bulk mode', async () => {
      const bulkOptions: AstroFileGeneratorSchema = {
        name: 'EmptyBulkComponent',
        kind: 'component',
        bulk: true,
        projects: [],
        skipFormat: true,
      };

      await expect(astroFileGenerator(tree, bulkOptions)).rejects.toThrow(
        'projects array is required when bulk=true'
      );
    });
  });

  describe('Memory and Resource Management', () => {
    test('should handle large file content generation without memory leaks', async () => {
      // Generate component with extremely large props definition
      const largePropsArray = Array.from({ length: 1000 }, (_, i) => `prop${i}:string`);
      const largeProps = largePropsArray.join(',');

      const options: ComponentGeneratorSchema = {
        name: 'LargePropsComponent',
        project: 'test-app',
        props: largeProps,
        skipFormat: true,
      };

      const startMemory = process.memoryUsage().heapUsed;
      
      await componentGenerator(tree, options);

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(tree.exists('apps/test-app/src/components/LargePropsComponent.astro')).toBe(true);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      // Verify content was generated correctly
      const content = tree.read('apps/test-app/src/components/LargePropsComponent.astro', 'utf-8');
      expect(content).toContain('prop0: string');
      expect(content).toContain('prop999: string');
      expect(content).toContain('LargePropsComponent');
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

function setupAdditionalProject(tree: Tree, projectName: string): void {
  setupProject(tree, projectName);
}
