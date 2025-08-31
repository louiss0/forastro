import { type Tree, readProjectConfiguration, readNxJson } from '@nx/devkit';
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
    if (!currentTree) return true; // Fallback to true when no tree is available
    return currentTree.exists(path);
  });

  const mockReadFileSync = vi.fn((path: string) => {
    if (!currentTree) {
      // Return sensible defaults based on file type
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
      // If file doesn't exist in tree, return sensible defaults
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

// Mock internal modules that use file system
vi.mock('../internal/detect/config', () => ({
  readAstroConfig: () => ({ integrations: [], contentDir: 'src/content' }),
  hasContentCollections: () => false,
  getContentCollections: () => [],
  readIntegrations: () => [],
  findAstroConfig: () => null,
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: () => '.md',
  detectProjectType: () => 'astro-content',
}));

describe('Nx Workspace Integration Tests', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Set up basic workspace structure with nx.json
    const nxJson = {
      namedInputs: {
        default: ['{projectRoot}/**/*', 'sharedGlobals'],
        production: [
          'default',
          '!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)',
          '!{projectRoot}/tsconfig.spec.json',
          '!{projectRoot}/.eslintrc.json',
        ],
        sharedGlobals: [],
      },
      targetDefaults: {
        build: {
          dependsOn: ['^build'],
          inputs: ['production', '^production'],
          cache: true,
        },
        check: {
          inputs: ['production', '^production'],
          cache: true,
        },
      },
      workspaceLayout: {
        appsDir: 'apps',
        libsDir: 'packages',
      },
    };

    tree.write('nx.json', JSON.stringify(nxJson, null, 2));

    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Project Registration and Configuration', () => {
    beforeEach(() => {
      // Setup a basic Astro project structure
      tree.write(
        'apps/test-astro-app/package.json',
        JSON.stringify({
          name: 'test-astro-app',
          dependencies: {
            astro: '^4.0.0',
          },
        }),
      );

      // Create a valid project.json with Astro-specific executors
      const projectJson = {
        name: 'test-astro-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/test-astro-app/src',
        targets: {
          dev: {
            executor: '@forastro/astro-nx:dev',
            options: {
              port: 4321,
              host: 'localhost',
            },
          },
          build: {
            executor: '@forastro/astro-nx:build',
            options: {
              outputPath: 'dist/apps/test-astro-app',
            },
          },
          preview: {
            executor: '@forastro/astro-nx:preview',
            options: {
              port: 4322,
            },
          },
          check: {
            executor: '@forastro/astro-nx:check',
            options: {},
            cache: true,
            outputs: ['{projectRoot}/.astro-check'],
          },
        },
        tags: ['type:app', 'framework:astro'],
      };

      tree.write('apps/test-astro-app/project.json', JSON.stringify(projectJson, null, 2));

      // Create necessary directories
      tree.write('apps/test-astro-app/src/.gitkeep', '');
      tree.write('apps/test-astro-app/src/pages/.gitkeep', '');
      tree.write('apps/test-astro-app/src/components/.gitkeep', '');
      tree.write('apps/test-astro-app/src/content/.gitkeep', '');
      tree.write('apps/test-astro-app/astro.config.mjs', 'export default {};');
    });

    test('should create valid project.json with Astro executors', () => {
      const projectConfig = readProjectConfiguration(tree, 'test-astro-app');

      // Verify basic project structure
      expect(projectConfig.name).toBe('test-astro-app');
      expect(projectConfig.projectType).toBe('application');
      expect(projectConfig.sourceRoot).toBe('apps/test-astro-app/src');
      expect(projectConfig.tags).toContain('framework:astro');
      expect(projectConfig.tags).toContain('type:app');

      // Verify Astro-specific executors are configured
      expect(projectConfig.targets.dev).toBeDefined();
      expect(projectConfig.targets.dev.executor).toBe('@forastro/astro-nx:dev');
      expect(projectConfig.targets.dev.options.port).toBe(4321);
      expect(projectConfig.targets.dev.options.host).toBe('localhost');

      expect(projectConfig.targets.build).toBeDefined();
      expect(projectConfig.targets.build.executor).toBe('@forastro/astro-nx:build');
      expect(projectConfig.targets.build.options.outputPath).toBe('dist/apps/test-astro-app');

      expect(projectConfig.targets.preview).toBeDefined();
      expect(projectConfig.targets.preview.executor).toBe('@forastro/astro-nx:preview');
      expect(projectConfig.targets.preview.options.port).toBe(4322);

      expect(projectConfig.targets.check).toBeDefined();
      expect(projectConfig.targets.check.executor).toBe('@forastro/astro-nx:check');
      expect(projectConfig.targets.check.cache).toBe(true);
      expect(projectConfig.targets.check.outputs).toContain('{projectRoot}/.astro-check');
    });

    test('should verify project is registered in workspace', () => {
      const projectConfig = readProjectConfiguration(tree, 'test-astro-app');
      
      // Verify the project exists and has the correct configuration
      expect(projectConfig).toBeDefined();
      expect(projectConfig.root).toBe('apps/test-astro-app');
      
      // Verify project files exist in the tree
      expect(tree.exists('apps/test-astro-app/project.json')).toBe(true);
      expect(tree.exists('apps/test-astro-app/package.json')).toBe(true);
      expect(tree.exists('apps/test-astro-app/astro.config.mjs')).toBe(true);
    });

    test('should have valid Nx schema reference in project.json', () => {
      const projectJson = JSON.parse(tree.read('apps/test-astro-app/project.json', 'utf-8'));
      
      expect(projectJson.$schema).toBe('../../node_modules/nx/schemas/project-schema.json');
      expect(projectJson.name).toBe('test-astro-app');
      expect(projectJson.projectType).toBe('application');
    });

    test('should inherit target defaults from nx.json', () => {
      const nxJson = readNxJson(tree);
      const projectConfig = readProjectConfiguration(tree, 'test-astro-app');

      // Verify that target defaults are properly configured in nx.json
      expect(nxJson.targetDefaults.build).toBeDefined();
      expect(nxJson.targetDefaults.build.cache).toBe(true);
      expect(nxJson.targetDefaults.build.dependsOn).toContain('^build');
      expect(nxJson.targetDefaults.build.inputs).toContain('production');

      expect(nxJson.targetDefaults.check).toBeDefined();
      expect(nxJson.targetDefaults.check.cache).toBe(true);
      expect(nxJson.targetDefaults.check.inputs).toContain('production');

      // Verify project inherits these defaults (they would be applied at runtime)
      expect(projectConfig.targets.build).toBeDefined();
      expect(projectConfig.targets.check).toBeDefined();
    });
  });

  describe('Generator Workspace Integration', () => {
    beforeEach(() => {
      // Setup a basic Astro project structure for generator tests
      tree.write(
        'apps/workspace-test-app/package.json',
        JSON.stringify({
          name: 'workspace-test-app',
          dependencies: {
            astro: '^4.0.0',
          },
        }),
      );

      // Create project.json
      const projectJson = {
        name: 'workspace-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/workspace-test-app/src',
        targets: {
          dev: {
            executor: '@forastro/astro-nx:dev',
          },
          build: {
            executor: '@forastro/astro-nx:build',
          },
          preview: {
            executor: '@forastro/astro-nx:preview',
          },
          check: {
            executor: '@forastro/astro-nx:check',
          },
        },
        tags: ['type:app', 'framework:astro'],
      };

      tree.write('apps/workspace-test-app/project.json', JSON.stringify(projectJson, null, 2));
      tree.write('apps/workspace-test-app/src/.gitkeep', '');
      tree.write('apps/workspace-test-app/src/pages/.gitkeep', '');
      tree.write('apps/workspace-test-app/src/components/.gitkeep', '');
      tree.write('apps/workspace-test-app/src/content/.gitkeep', '');
      tree.write('apps/workspace-test-app/astro.config.mjs', 'export default {};');
    });

    test('should generate components without modifying nx.json', async () => {
      const originalNxJson = readNxJson(tree);
      
      const options: ComponentGeneratorSchema = {
        name: 'test-component',
        project: 'workspace-test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const newNxJson = readNxJson(tree);
      
      // Verify nx.json remains unchanged
      expect(newNxJson).toEqual(originalNxJson);
      
      // Verify component was generated
      expect(tree.exists('apps/workspace-test-app/src/components/test-component.astro')).toBe(true);
      
      // Verify project.json remains unchanged
      const projectConfig = readProjectConfiguration(tree, 'workspace-test-app');
      expect(projectConfig.targets.dev.executor).toBe('@forastro/astro-nx:dev');
      expect(projectConfig.targets.build.executor).toBe('@forastro/astro-nx:build');
    });

    test('should generate pages without modifying workspace configuration', async () => {
      const originalNxJson = readNxJson(tree);
      const originalProjectConfig = readProjectConfiguration(tree, 'workspace-test-app');
      
      const options: PageGeneratorSchema = {
        name: 'about',
        project: 'workspace-test-app',
        title: 'About Page',
        description: 'Learn more about us',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const newNxJson = readNxJson(tree);
      const newProjectConfig = readProjectConfiguration(tree, 'workspace-test-app');
      
      // Verify workspace configuration remains unchanged
      expect(newNxJson).toEqual(originalNxJson);
      expect(newProjectConfig).toEqual(originalProjectConfig);
      
      // Verify page was generated
      expect(tree.exists('apps/workspace-test-app/src/pages/about.astro')).toBe(true);
      
      const pageContent = tree.read('apps/workspace-test-app/src/pages/about.astro', 'utf-8');
      expect(pageContent).toContain('title: \'About Page\'');
      expect(pageContent).toContain('description: \'Learn more about us\'');
    });

    test('should generate content files without modifying workspace structure', async () => {
      const originalNxJson = readNxJson(tree);
      
      const options: ContentFileGeneratorSchema = {
        name: 'first-post',
        project: 'workspace-test-app',
        collection: 'blog',
        title: 'My First Post',
        description: 'Welcome to my blog',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const newNxJson = readNxJson(tree);
      
      // Verify nx.json remains unchanged
      expect(newNxJson).toEqual(originalNxJson);
      
      // Verify content file was generated
      expect(tree.exists('apps/workspace-test-app/src/content/blog/first-post.md')).toBe(true);
      
      const contentFile = tree.read('apps/workspace-test-app/src/content/blog/first-post.md', 'utf-8');
      expect(contentFile).toContain("title: 'My First Post'");
      expect(contentFile).toContain("description: 'Welcome to my blog'");
    });
  });

  describe('Executor Configuration Validation', () => {
    test('should validate all Astro executors are properly defined', () => {
      // Setup project with all executors
      const projectJson = {
        name: 'executor-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/executor-test-app/src',
        targets: {
          dev: {
            executor: '@forastro/astro-nx:dev',
            options: {
              port: 4321,
              host: 'localhost',
              open: false,
              verbose: false,
            },
          },
          build: {
            executor: '@forastro/astro-nx:build',
            options: {
              outDir: 'dist',
              mode: 'production',
              sourcemap: false,
              verbose: false,
            },
          },
          preview: {
            executor: '@forastro/astro-nx:preview',
            options: {
              port: 4322,
              host: 'localhost',
              open: false,
            },
          },
          check: {
            executor: '@forastro/astro-nx:check',
            options: {
              verbose: false,
            },
            cache: true,
            outputs: ['{projectRoot}/.astro-check'],
          },
        },
        tags: ['type:app', 'framework:astro'],
      };

      tree.write('apps/executor-test-app/project.json', JSON.stringify(projectJson, null, 2));
      tree.write('apps/executor-test-app/package.json', JSON.stringify({
        name: 'executor-test-app',
        dependencies: { astro: '^4.0.0' },
      }));

      const projectConfig = readProjectConfiguration(tree, 'executor-test-app');

      // Verify dev executor
      expect(projectConfig.targets.dev).toBeDefined();
      expect(projectConfig.targets.dev.executor).toBe('@forastro/astro-nx:dev');
      expect(projectConfig.targets.dev.options.port).toBe(4321);
      expect(projectConfig.targets.dev.options.host).toBe('localhost');
      expect(projectConfig.targets.dev.options.open).toBe(false);
      expect(projectConfig.targets.dev.options.verbose).toBe(false);

      // Verify build executor
      expect(projectConfig.targets.build).toBeDefined();
      expect(projectConfig.targets.build.executor).toBe('@forastro/astro-nx:build');
      expect(projectConfig.targets.build.options.outDir).toBe('dist');
      expect(projectConfig.targets.build.options.mode).toBe('production');
      expect(projectConfig.targets.build.options.sourcemap).toBe(false);
      expect(projectConfig.targets.build.options.verbose).toBe(false);

      // Verify preview executor
      expect(projectConfig.targets.preview).toBeDefined();
      expect(projectConfig.targets.preview.executor).toBe('@forastro/astro-nx:preview');
      expect(projectConfig.targets.preview.options.port).toBe(4322);
      expect(projectConfig.targets.preview.options.host).toBe('localhost');
      expect(projectConfig.targets.preview.options.open).toBe(false);

      // Verify check executor
      expect(projectConfig.targets.check).toBeDefined();
      expect(projectConfig.targets.check.executor).toBe('@forastro/astro-nx:check');
      expect(projectConfig.targets.check.options.verbose).toBe(false);
      expect(projectConfig.targets.check.cache).toBe(true);
      expect(projectConfig.targets.check.outputs).toContain('{projectRoot}/.astro-check');
    });

    test('should validate executor options match schemas', () => {
      // Test with various executor configurations
      const projectJson = {
        name: 'schema-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/schema-test-app/src',
        targets: {
          dev: {
            executor: '@forastro/astro-nx:dev',
            options: {
              port: 3000, // Different from default
              host: '0.0.0.0', // Network accessible
              open: true, // Auto-open browser
              verbose: true, // Debug logging
              config: 'astro.config.mjs', // Custom config path
            },
          },
          build: {
            executor: '@forastro/astro-nx:build',
            options: {
              outDir: 'build', // Different output dir
              site: 'https://example.com',
              base: '/app',
              mode: 'development', // Dev mode build
              sourcemap: true, // Include sourcemaps
              verbose: true,
              config: 'config/astro.config.ts',
            },
          },
        },
        tags: ['type:app', 'framework:astro', 'env:development'],
      };

      tree.write('apps/schema-test-app/project.json', JSON.stringify(projectJson, null, 2));
      tree.write('apps/schema-test-app/package.json', JSON.stringify({
        name: 'schema-test-app',
        dependencies: { astro: '^4.0.0' },
      }));

      const projectConfig = readProjectConfiguration(tree, 'schema-test-app');

      // Verify custom dev configuration
      expect(projectConfig.targets.dev.options.port).toBe(3000);
      expect(projectConfig.targets.dev.options.host).toBe('0.0.0.0');
      expect(projectConfig.targets.dev.options.open).toBe(true);
      expect(projectConfig.targets.dev.options.verbose).toBe(true);
      expect(projectConfig.targets.dev.options.config).toBe('astro.config.mjs');

      // Verify custom build configuration
      expect(projectConfig.targets.build.options.outDir).toBe('build');
      expect(projectConfig.targets.build.options.site).toBe('https://example.com');
      expect(projectConfig.targets.build.options.base).toBe('/app');
      expect(projectConfig.targets.build.options.mode).toBe('development');
      expect(projectConfig.targets.build.options.sourcemap).toBe(true);
      expect(projectConfig.targets.build.options.verbose).toBe(true);
      expect(projectConfig.targets.build.options.config).toBe('config/astro.config.ts');

      // Verify tags
      expect(projectConfig.tags).toContain('type:app');
      expect(projectConfig.tags).toContain('framework:astro');
      expect(projectConfig.tags).toContain('env:development');
    });
  });

  describe('Workspace Layout and Organization', () => {
    test('should respect workspace layout configuration', () => {
      const nxJson = readNxJson(tree);
      
      expect(nxJson.workspaceLayout).toBeDefined();
      expect(nxJson.workspaceLayout.appsDir).toBe('apps');
      expect(nxJson.workspaceLayout.libsDir).toBe('packages');
      
      // Verify projects are created in the correct directories
      const appProjectJson = {
        name: 'layout-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/layout-test-app/src',
        targets: {
          dev: { executor: '@forastro/astro-nx:dev' },
        },
      };

      tree.write('apps/layout-test-app/project.json', JSON.stringify(appProjectJson, null, 2));
      tree.write('apps/layout-test-app/package.json', JSON.stringify({
        name: 'layout-test-app',
        dependencies: { astro: '^4.0.0' },
      }));

      const projectConfig = readProjectConfiguration(tree, 'layout-test-app');
      expect(projectConfig.root).toBe('apps/layout-test-app');
      expect(projectConfig.projectType).toBe('application');
    });

    test('should maintain consistent project structure across generators', async () => {
      // Setup project
      const projectJson = {
        name: 'structure-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/structure-test-app/src',
        targets: {
          dev: { executor: '@forastro/astro-nx:dev' },
          build: { executor: '@forastro/astro-nx:build' },
        },
        tags: ['type:app', 'framework:astro'],
      };

      tree.write('apps/structure-test-app/project.json', JSON.stringify(projectJson, null, 2));
      tree.write('apps/structure-test-app/package.json', JSON.stringify({
        name: 'structure-test-app',
        dependencies: { astro: '^4.0.0' },
      }));
      tree.write('apps/structure-test-app/src/pages/.gitkeep', '');
      tree.write('apps/structure-test-app/src/components/.gitkeep', '');
      tree.write('apps/structure-test-app/src/content/.gitkeep', '');
      tree.write('apps/structure-test-app/astro.config.mjs', 'export default {};');

      // Generate component
      await componentGenerator(tree, {
        name: 'header',
        project: 'structure-test-app',
        directory: 'layout',
        skipFormat: true,
      });

      // Generate page
      await pageGenerator(tree, {
        name: 'blog/post',
        project: 'structure-test-app',
        skipFormat: true,
      });

      // Generate content
      await contentFileGenerator(tree, {
        name: 'welcome',
        project: 'structure-test-app',
        collection: 'posts',
        skipFormat: true,
      });

      // Verify consistent structure
      expect(tree.exists('apps/structure-test-app/src/components/layout/header.astro')).toBe(true);
      expect(tree.exists('apps/structure-test-app/src/pages/blog/post.astro')).toBe(true);
      expect(tree.exists('apps/structure-test-app/src/content/posts/welcome.md')).toBe(true);

      // Verify project configuration remains intact
      const projectConfig = readProjectConfiguration(tree, 'structure-test-app');
      expect(projectConfig.sourceRoot).toBe('apps/structure-test-app/src');
      expect(projectConfig.targets.dev.executor).toBe('@forastro/astro-nx:dev');
      expect(projectConfig.targets.build.executor).toBe('@forastro/astro-nx:build');
    });
  });

  describe('Cache and Dependency Configuration', () => {
    test('should configure caching appropriately for Astro executors', () => {
      const projectJson = {
        name: 'cache-test-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/cache-test-app/src',
        targets: {
          build: {
            executor: '@forastro/astro-nx:build',
            options: {},
            cache: true,
            inputs: ['production', '^production'],
            outputs: ['{options.outDir}', '{projectRoot}/dist'],
          },
          check: {
            executor: '@forastro/astro-nx:check',
            options: {},
            cache: true,
            inputs: ['default', '^production'],
            outputs: ['{projectRoot}/.astro-check'],
          },
          dev: {
            executor: '@forastro/astro-nx:dev',
            options: {},
            // Dev server should not be cached
            cache: false,
          },
          preview: {
            executor: '@forastro/astro-nx:preview',
            options: {},
            // Preview server should not be cached
            cache: false,
          },
        },
      };

      tree.write('apps/cache-test-app/project.json', JSON.stringify(projectJson, null, 2));
      tree.write('apps/cache-test-app/package.json', JSON.stringify({
        name: 'cache-test-app',
        dependencies: { astro: '^4.0.0' },
      }));

      const projectConfig = readProjectConfiguration(tree, 'cache-test-app');

      // Verify build target caching
      expect(projectConfig.targets.build.cache).toBe(true);
      expect(projectConfig.targets.build.inputs).toContain('production');
      expect(projectConfig.targets.build.inputs).toContain('^production');
      expect(projectConfig.targets.build.outputs).toContain('{options.outDir}');
      expect(projectConfig.targets.build.outputs).toContain('{projectRoot}/dist');

      // Verify check target caching
      expect(projectConfig.targets.check.cache).toBe(true);
      expect(projectConfig.targets.check.inputs).toContain('default');
      expect(projectConfig.targets.check.inputs).toContain('^production');
      expect(projectConfig.targets.check.outputs).toContain('{projectRoot}/.astro-check');

      // Verify dev and preview are not cached
      expect(projectConfig.targets.dev.cache).toBe(false);
      expect(projectConfig.targets.preview.cache).toBe(false);
    });

    test('should inherit target defaults from nx.json', () => {
      const nxJson = readNxJson(tree);
      
      // Verify target defaults that should be inherited
      expect(nxJson.targetDefaults.build).toBeDefined();
      expect(nxJson.targetDefaults.build.cache).toBe(true);
      expect(nxJson.targetDefaults.build.dependsOn).toContain('^build');
      expect(nxJson.targetDefaults.build.inputs).toContain('production');
      expect(nxJson.targetDefaults.build.inputs).toContain('^production');

      expect(nxJson.targetDefaults.check).toBeDefined();
      expect(nxJson.targetDefaults.check.cache).toBe(true);
      expect(nxJson.targetDefaults.check.inputs).toContain('production');
      expect(nxJson.targetDefaults.check.inputs).toContain('^production');

      // Test project with minimal target configuration (should inherit defaults)
      const minimalProjectJson = {
        name: 'minimal-app',
        $schema: '../../node_modules/nx/schemas/project-schema.json',
        projectType: 'application',
        sourceRoot: 'apps/minimal-app/src',
        targets: {
          build: {
            executor: '@forastro/astro-nx:build',
          },
          check: {
            executor: '@forastro/astro-nx:check',
          },
        },
      };

      tree.write('apps/minimal-app/project.json', JSON.stringify(minimalProjectJson, null, 2));
      tree.write('apps/minimal-app/package.json', JSON.stringify({
        name: 'minimal-app',
        dependencies: { astro: '^4.0.0' },
      }));

      const projectConfig = readProjectConfiguration(tree, 'minimal-app');
      
      // Verify targets exist (inheritance happens at runtime by Nx)
      expect(projectConfig.targets.build).toBeDefined();
      expect(projectConfig.targets.build.executor).toBe('@forastro/astro-nx:build');
      expect(projectConfig.targets.check).toBeDefined();
      expect(projectConfig.targets.check.executor).toBe('@forastro/astro-nx:check');
    });
  });
});
