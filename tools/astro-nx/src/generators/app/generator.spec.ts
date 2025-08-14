import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import appGenerator from './generator';
import type { AppGeneratorSchema } from './generator';

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
          dependencies: { react: '^18.0.0' },
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
          dependencies: { react: '^18.0.0' },
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
vi.mock('../../internal/detect/config', () => ({
  readAstroConfig: () => ({ integrations: [], contentDir: 'src/content' }),
  hasContentCollections: () => false,
  getContentCollections: () => [],
  readIntegrations: () => [],
  findAstroConfig: () => null,
}));

vi.mock('../../internal/detect/project-type', () => ({
  getDefaultContentExt: () => '.md',
  detectProjectType: () => 'react-vite',
}));

describe('App Generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Setup basic workspace structure
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'test-workspace',
        devDependencies: {
          '@nx/workspace': '^17.0.0',
        },
      }),
    );

    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Basic App Generation', () => {
    test('should generate basic React Vite app', async () => {
      const options: AppGeneratorSchema = {
        name: 'my-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      // Verify app directory structure
      expect(tree.exists('apps/my-app')).toBe(true);
      expect(tree.exists('apps/my-app/project.json')).toBe(true);
      expect(tree.exists('apps/my-app/package.json')).toBe(true);

      // Verify Vite config
      expect(tree.exists('apps/my-app/vite.config.ts')).toBe(true);
      const viteConfig = tree.read('apps/my-app/vite.config.ts', 'utf-8');
      expect(viteConfig).toContain('@vitejs/plugin-react');
      expect(viteConfig).toContain('UnoCSS');

      // Verify src directory structure
      expect(tree.exists('apps/my-app/src/main.tsx')).toBe(true);
      expect(tree.exists('apps/my-app/src/App.tsx')).toBe(true);
      expect(tree.exists('apps/my-app/src/index.css')).toBe(true);

      // Verify UnoCSS imports in main.tsx
      const mainContent = tree.read('apps/my-app/src/main.tsx', 'utf-8');
      expect(mainContent).toContain("import '@unocss/reset/tailwind.css'");
      expect(mainContent).toContain("import 'virtual:uno.css'");
      expect(mainContent).toContain("import 'virtual:unocss-devtools'");

      // Verify basic project configuration
      const projectJson = JSON.parse(tree.read('apps/my-app/project.json', 'utf-8'));
      expect(projectJson.name).toBe('my-app');
      expect(projectJson.projectType).toBe('application');
    });

    test('should generate app with custom directory', async () => {
      const options: AppGeneratorSchema = {
        name: 'custom-app',
        directory: 'frontend',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      // Verify custom directory structure
      expect(tree.exists('apps/frontend/custom-app')).toBe(true);
      expect(tree.exists('apps/frontend/custom-app/project.json')).toBe(true);
      expect(tree.exists('apps/frontend/custom-app/package.json')).toBe(true);
    });

    test('should generate app with tags', async () => {
      const options: AppGeneratorSchema = {
        name: 'tagged-app',
        tags: 'scope:frontend,type:app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const projectJson = JSON.parse(tree.read('apps/tagged-app/project.json', 'utf-8'));
      expect(projectJson.tags).toEqual(['scope:frontend', 'type:app']);
    });
  });

  describe('Package Management and Dependencies', () => {
    test('should configure dependencies correctly', async () => {
      const options: AppGeneratorSchema = {
        name: 'deps-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/deps-app/package.json', 'utf-8'));
      
      // Core React/Vite dependencies
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
      
      // Development dependencies
      expect(packageJson.devDependencies.vite).toBeDefined();
      expect(packageJson.devDependencies['@vitejs/plugin-react']).toBeDefined();
      expect(packageJson.devDependencies.unocss).toBeDefined();
      expect(packageJson.devDependencies['@biomejs/biome']).toBeDefined();
      expect(packageJson.devDependencies.eslint).toBeDefined();
    });

    test('should include React Query when specified', async () => {
      const options: AppGeneratorSchema = {
        name: 'query-app',
        reactQuery: true,
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/query-app/package.json', 'utf-8'));
      expect(packageJson.dependencies['@tanstack/react-query']).toBeDefined();
      expect(packageJson.dependencies.axios).toBeDefined();

      const mainContent = tree.read('apps/query-app/src/main.tsx', 'utf-8');
      expect(mainContent).toContain('QueryClient');
      expect(mainContent).toContain('QueryClientProvider');
    });

    test('should include Prime React when specified', async () => {
      const options: AppGeneratorSchema = {
        name: 'prime-app',
        primeReact: true,
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/prime-app/package.json', 'utf-8'));
      expect(packageJson.dependencies.primereact).toBeDefined();
      expect(packageJson.dependencies.primeicons).toBeDefined();
    });

    test('should include additional tools when specified', async () => {
      const options: AppGeneratorSchema = {
        name: 'full-app',
        reactQuery: true,
        primeReact: true,
        nuqs: true,
        zod: true,
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/full-app/package.json', 'utf-8'));
      expect(packageJson.dependencies.nuqs).toBeDefined();
      expect(packageJson.dependencies.zod).toBeDefined();
    });
  });

  describe('Configuration Files', () => {
    test('should generate UnoCSS config', async () => {
      const options: AppGeneratorSchema = {
        name: 'uno-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      expect(tree.exists('apps/uno-app/uno.config.ts')).toBe(true);
      const unoConfig = tree.read('apps/uno-app/uno.config.ts', 'utf-8');
      expect(unoConfig).toContain('presetWind');
      expect(unoConfig).toContain('transformerVariantGroup');
      expect(unoConfig).toContain('blocklist');
    });

    test('should generate ESLint config', async () => {
      const options: AppGeneratorSchema = {
        name: 'eslint-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      expect(tree.exists('apps/eslint-app/eslint.config.ts')).toBe(true);
      const eslintConfig = tree.read('apps/eslint-app/eslint.config.ts', 'utf-8');
      expect(eslintConfig).toContain('@typescript-eslint/eslint-plugin');
      expect(eslintConfig).toContain('eslint-plugin-react');
      expect(eslintConfig).toContain('eslint-plugin-react-hooks');
    });

    test('should generate Biome config', async () => {
      const options: AppGeneratorSchema = {
        name: 'biome-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      expect(tree.exists('apps/biome-app/biome.json')).toBe(true);
      const biomeConfig = JSON.parse(tree.read('apps/biome-app/biome.json', 'utf-8'));
      expect(biomeConfig.formatter.enabled).toBe(true);
      expect(biomeConfig.linter.enabled).toBe(false);
    });

    test('should generate TypeScript config', async () => {
      const options: AppGeneratorSchema = {
        name: 'ts-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      expect(tree.exists('apps/ts-app/tsconfig.json')).toBe(true);
      expect(tree.exists('apps/ts-app/tsconfig.node.json')).toBe(true);
    });
  });

  describe('Source Code Generation', () => {
    test('should generate main.tsx with proper imports', async () => {
      const options: AppGeneratorSchema = {
        name: 'main-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const mainContent = tree.read('apps/main-app/src/main.tsx', 'utf-8');
      
      // UnoCSS imports in correct order
      expect(mainContent).toContain("import '@unocss/reset/tailwind.css'");
      expect(mainContent).toContain("import 'virtual:uno.css'");
      expect(mainContent).toContain("import 'virtual:unocss-devtools'");
      
      // React imports
      expect(mainContent).toContain("import React from 'react'");
      expect(mainContent).toContain("import ReactDOM from 'react-dom/client'");
      expect(mainContent).toContain("import App from './App'");
    });

    test('should generate App.tsx with basic structure', async () => {
      const options: AppGeneratorSchema = {
        name: 'app-component',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const appContent = tree.read('apps/app-component/src/App.tsx', 'utf-8');
      expect(appContent).toContain('function App()');
      expect(appContent).toContain('export default App');
    });

    test('should generate index.html with proper title', async () => {
      const options: AppGeneratorSchema = {
        name: 'html-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const htmlContent = tree.read('apps/html-app/index.html', 'utf-8');
      expect(htmlContent).toContain('<title>HTML App</title>');
      expect(htmlContent).toContain('<div id="root"></div>');
    });
  });

  describe('Project Configuration', () => {
    test('should generate Nx project.json with correct targets', async () => {
      const options: AppGeneratorSchema = {
        name: 'targets-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const projectJson = JSON.parse(tree.read('apps/targets-app/project.json', 'utf-8'));
      expect(projectJson.targets.dev).toBeDefined();
      expect(projectJson.targets.build).toBeDefined();
      expect(projectJson.targets.preview).toBeDefined();
      expect(projectJson.targets.lint).toBeDefined();
    });

    test('should configure dev target correctly', async () => {
      const options: AppGeneratorSchema = {
        name: 'dev-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const projectJson = JSON.parse(tree.read('apps/dev-app/project.json', 'utf-8'));
      expect(projectJson.targets.dev.executor).toBe('@nx/vite:dev-server');
    });

    test('should configure build target correctly', async () => {
      const options: AppGeneratorSchema = {
        name: 'build-app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const projectJson = JSON.parse(tree.read('apps/build-app/project.json', 'utf-8'));
      expect(projectJson.targets.build.executor).toBe('@nx/vite:build');
      expect(projectJson.targets.build.outputs).toContain('{options.outputPath}');
    });
  });

  describe('Font Configuration', () => {
    test('should include font configuration when specified', async () => {
      const options: AppGeneratorSchema = {
        name: 'font-app',
        fontsource: true,
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const viteConfig = tree.read('apps/font-app/vite.config.ts', 'utf-8');
      expect(viteConfig).toContain('unplugin-fonts');
      expect(viteConfig).toContain('fontsource');

      const mainContent = tree.read('apps/font-app/src/main.tsx', 'utf-8');
      expect(mainContent).toContain('unfonts.css');
    });
  });

  describe('Package Manager Support', () => {
    test('should handle pnpm workspace configuration', async () => {
      const options: AppGeneratorSchema = {
        name: 'pnpm-app',
        packageManager: 'pnpm',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/pnpm-app/package.json', 'utf-8'));
      expect(packageJson.packageManager).toContain('pnpm');
    });

    test('should handle JPD package manager when specified', async () => {
      const options: AppGeneratorSchema = {
        name: 'jpd-app',
        packageManager: 'jpd',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      const packageJson = JSON.parse(tree.read('apps/jpd-app/package.json', 'utf-8'));
      // JPD should fall back to pnpm if not available
      expect(packageJson.packageManager).toContain('pnpm');
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid app name', async () => {
      const options: AppGeneratorSchema = {
        name: 'Invalid Name!',
        skipFormat: true,
      };

      await expect(appGenerator(tree, options)).rejects.toThrow();
    });

    test('should handle existing directory gracefully', async () => {
      // Create existing directory
      tree.write('apps/existing-app/test.txt', 'existing content');

      const options: AppGeneratorSchema = {
        name: 'existing-app',
        skipFormat: true,
      };

      await expect(appGenerator(tree, options)).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should create fully functional React Vite app with all features', async () => {
      const options: AppGeneratorSchema = {
        name: 'full-featured-app',
        reactQuery: true,
        primeReact: true,
        nuqs: true,
        zod: true,
        fontsource: true,
        tags: 'scope:frontend,type:app',
        skipFormat: true,
      };

      await appGenerator(tree, options);

      // Verify all files exist
      expect(tree.exists('apps/full-featured-app/project.json')).toBe(true);
      expect(tree.exists('apps/full-featured-app/package.json')).toBe(true);
      expect(tree.exists('apps/full-featured-app/vite.config.ts')).toBe(true);
      expect(tree.exists('apps/full-featured-app/uno.config.ts')).toBe(true);
      expect(tree.exists('apps/full-featured-app/eslint.config.ts')).toBe(true);
      expect(tree.exists('apps/full-featured-app/biome.json')).toBe(true);
      expect(tree.exists('apps/full-featured-app/src/main.tsx')).toBe(true);
      expect(tree.exists('apps/full-featured-app/src/App.tsx')).toBe(true);

      // Verify all dependencies are included
      const packageJson = JSON.parse(tree.read('apps/full-featured-app/package.json', 'utf-8'));
      expect(packageJson.dependencies['@tanstack/react-query']).toBeDefined();
      expect(packageJson.dependencies.primereact).toBeDefined();
      expect(packageJson.dependencies.nuqs).toBeDefined();
      expect(packageJson.dependencies.zod).toBeDefined();

      // Verify tags
      const projectJson = JSON.parse(tree.read('apps/full-featured-app/project.json', 'utf-8'));
      expect(projectJson.tags).toEqual(['scope:frontend', 'type:app']);
    });
  });
});
