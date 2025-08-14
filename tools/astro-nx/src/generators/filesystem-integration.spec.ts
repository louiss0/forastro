import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import astroFileGenerator from './astro-file/generator';
import type { AstroFileGeneratorSchema } from './astro-file/generator';
import { ensureTreeDirs } from '../internal/fs/tree-io';

describe('Generator Filesystem Integration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('Apps Convention Integration', () => {
    test('should create files in correct apps/ structure via generator', async () => {
      const projectName = 'test-astro-project';
      const options: AstroFileGeneratorSchema = {
        name: 'welcome',
        project: projectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);

      // Verify file was created in apps/ directory
      expect(tree.exists(`apps/${projectName}/src/pages/welcome.astro`)).toBe(true);
      
      // Verify content is correct
      const content = tree.read(`apps/${projectName}/src/pages/welcome.astro`, 'utf-8');
      expect(content).toContain('Welcome');
      expect(content).toContain('<h1>Welcome</h1>');
    });

    test('should handle nested directory structure in apps/', async () => {
      const projectName = 'complex-app';
      
      // Create nested page
      const pageOptions: AstroFileGeneratorSchema = {
        name: 'settings/profile',
        project: projectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, pageOptions);

      // Create nested component using directory option
      const componentOptions: AstroFileGeneratorSchema = {
        name: 'ProfileForm',
        project: projectName,
        directory: 'ui/forms',
        kind: 'component',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, componentOptions);

      // Verify nested structure was created correctly
      expect(tree.exists(`apps/${projectName}/src/pages/settings/profile.astro`)).toBe(true);
      expect(tree.exists(`apps/${projectName}/src/components/ui/forms/profile-form.astro`)).toBe(true);
    });

    test('should handle bulk generation across multiple apps', async () => {
      const projectNames = ['app-one', 'app-two', 'app-three'];
      
      const bulkOptions: AstroFileGeneratorSchema = {
        name: 'common-page',
        project: '', // Not used in bulk mode
        kind: 'page',
        ext: 'astro',
        bulk: true,
        projects: projectNames,
        skipFormat: true
      };

      await astroFileGenerator(tree, bulkOptions);

      // Verify page was created in all apps
      projectNames.forEach(projectName => {
        expect(tree.exists(`apps/${projectName}/src/pages/common-page.astro`)).toBe(true);
      });
    });

    test('should respect custom destination within apps structure', async () => {
      const projectName = 'custom-dest-app';
      const options: AstroFileGeneratorSchema = {
        name: 'middleware',
        project: projectName,
        kind: 'file',
        destination: 'middleware',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);

      // Verify file was created in custom destination within src/
      expect(tree.exists(`apps/${projectName}/src/middleware/middleware.astro`)).toBe(true);
    });
  });

  describe('Directory Conflict Resolution', () => {
    test('should handle existing project structure gracefully', async () => {
      const projectName = 'existing-project';
      const projectRoot = `apps/${projectName}`;

      // Create existing project structure
      tree.write(`${projectRoot}/package.json`, JSON.stringify({
        name: projectName,
        dependencies: { astro: '^4.0.0' }
      }));
      tree.write(`${projectRoot}/src/pages/index.astro`, '<h1>Existing Home</h1>');
      tree.write(`${projectRoot}/src/components/Header.astro`, '<header>Existing Header</header>');

      // Generate new file in existing project
      const options: AstroFileGeneratorSchema = {
        name: 'about',
        project: projectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);

      // Verify existing files are preserved
      expect(tree.read(`${projectRoot}/src/pages/index.astro`, 'utf-8')).toBe('<h1>Existing Home</h1>');
      expect(tree.read(`${projectRoot}/src/components/Header.astro`, 'utf-8')).toBe('<header>Existing Header</header>');
      
      // Verify new file was added
      expect(tree.exists(`${projectRoot}/src/pages/about.astro`)).toBe(true);
    });

    test('should handle conflicting file names appropriately', async () => {
      const projectName = 'conflict-project';
      
      // Create first file
      const firstOptions: AstroFileGeneratorSchema = {
        name: 'contact',
        project: projectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, firstOptions);
      expect(tree.exists(`apps/${projectName}/src/pages/contact.astro`)).toBe(true);

      // Attempt to create file with same name but different content type
      const secondOptions: AstroFileGeneratorSchema = {
        name: 'contact',
        project: projectName,
        kind: 'page',
        ext: 'mdx',
        skipFormat: true
      };

      await astroFileGenerator(tree, secondOptions);

      // Both files should exist with different extensions
      expect(tree.exists(`apps/${projectName}/src/pages/contact.astro`)).toBe(true);
      expect(tree.exists(`apps/${projectName}/src/pages/contact.mdx`)).toBe(true);
    });

    test('should handle directory vs file naming conflicts', async () => {
      const projectName = 'naming-conflict';
      
      // Create a directory structure first
      ensureTreeDirs(tree, `apps/${projectName}/src/components/Button`);
      tree.write(`apps/${projectName}/src/components/Button/index.astro`, '<button><slot /></button>');
      tree.write(`apps/${projectName}/src/components/Button/variants.astro`, '<button class="variant"><slot /></button>');

      // Now try to create a file with the same base name
      const options: AstroFileGeneratorSchema = {
        name: 'Button',
        project: projectName,
        kind: 'component',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);

      // Both directory structure and file should coexist
      expect(tree.exists(`apps/${projectName}/src/components/Button/index.astro`)).toBe(true);
      expect(tree.exists(`apps/${projectName}/src/components/Button/variants.astro`)).toBe(true);
      expect(tree.exists(`apps/${projectName}/src/components/button.astro`)).toBe(true);
    });
  });

  describe('Project Name Edge Cases', () => {
    test('should handle special characters in project names', async () => {
      const specialProjects = [
        'my-app-2024',
        'app_with_underscores',
        'app.with.dots',
        'app-123-numbers'
      ];

      for (const projectName of specialProjects) {
        const options: AstroFileGeneratorSchema = {
          name: 'test-page',
          project: projectName,
          kind: 'page',
          ext: 'astro',
          skipFormat: true
        };

        await astroFileGenerator(tree, options);
        expect(tree.exists(`apps/${projectName}/src/pages/test-page.astro`)).toBe(true);
      }
    });

    test('should handle very long project names', async () => {
      const longProjectName = 'my-extremely-long-project-name-with-many-hyphens-and-words-that-exceeds-normal-length-expectations';
      
      const options: AstroFileGeneratorSchema = {
        name: 'index',
        project: longProjectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);
      expect(tree.exists(`apps/${longProjectName}/src/pages/index.astro`)).toBe(true);
    });

    test('should normalize project names while preserving structure', async () => {
      const projectsWithSpecialChars = [
        'Project With Spaces',
        'project@with#symbols',
        'PROJECT_IN_CAPS'
      ];

      for (const originalName of projectsWithSpecialChars) {
        const options: AstroFileGeneratorSchema = {
          name: 'home',
          project: originalName,
          kind: 'page',
          ext: 'astro',
          skipFormat: true
        };

        // The generator should handle the project name as-is
        // (normalization would be handled by the Nx workspace setup)
        await astroFileGenerator(tree, options);
        expect(tree.exists(`apps/${originalName}/src/pages/home.astro`)).toBe(true);
      }
    });
  });

  describe('Complex Directory Structures', () => {
    test('should create deeply nested content collections', async () => {
      const projectName = 'content-heavy-app';
      const contentPaths = [
        'blog/2024/tech/web-development',
        'blog/2024/tech/mobile-development',
        'docs/api/v1/authentication',
        'docs/guides/getting-started',
        'portfolio/projects/2023/react-apps'
      ];

      for (const contentPath of contentPaths) {
        const options: AstroFileGeneratorSchema = {
          name: 'sample-content',
          project: projectName,
          kind: 'file',
          destination: `content/${contentPath}`,
          ext: 'md',
          skipFormat: true
        };

        await astroFileGenerator(tree, options);
        expect(tree.exists(`apps/${projectName}/src/content/${contentPath}/sample-content.md`)).toBe(true);
      }
    });

    test('should handle complex component hierarchies', async () => {
      const projectName = 'component-library';
      const componentStructure = [
        { name: 'PrimaryButton', directory: 'ui/buttons' },
        { name: 'SecondaryButton', directory: 'ui/buttons' },
        { name: 'TextInput', directory: 'ui/forms' },
        { name: 'SelectInput', directory: 'ui/forms' },
        { name: 'MainHeader', directory: 'layout/headers' },
        { name: 'AdminHeader', directory: 'layout/headers' },
        { name: 'MainMenu', directory: 'navigation/menus' },
        { name: 'Breadcrumb', directory: 'navigation/breadcrumbs' }
      ];

      for (const component of componentStructure) {
        const options: AstroFileGeneratorSchema = {
          name: component.name,
          project: projectName,
          directory: component.directory,
          kind: 'component',
          ext: 'astro',
          skipFormat: true
        };

        await astroFileGenerator(tree, options);
        const kebabName = component.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        expect(tree.exists(`apps/${projectName}/src/components/${component.directory}/${kebabName}.astro`)).toBe(true);
      }
    });

    test('should handle mixed routing structures', async () => {
      const projectName = 'complex-routing-app';
      const routes = [
        'index',
        'about',
        'blog/index',
        'blog/[slug]',
        'blog/category/[category]',
        'admin/dashboard',
        'admin/users/[id]',
        'api/posts',
        'api/users/[id]'
      ];

      for (const route of routes) {
        const options: AstroFileGeneratorSchema = {
          name: route,
          project: projectName,
          kind: 'page',
          ext: 'astro',
          skipFormat: true
        };

        await astroFileGenerator(tree, options);
        expect(tree.exists(`apps/${projectName}/src/pages/${route}.astro`)).toBe(true);
      }
    });
  });

  describe('Workspace Structure Validation', () => {
    test('should maintain separation between apps and packages', async () => {
      // Create app structure
      const appOptions: AstroFileGeneratorSchema = {
        name: 'app-page',
        project: 'my-app',
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, appOptions);

      // Manually create package structure (simulating other generators)
      ensureTreeDirs(tree, 'packages/shared-components/src');
      tree.write('packages/shared-components/src/Button.astro', '<button><slot /></button>');
      tree.write('packages/shared-components/package.json', JSON.stringify({
        name: '@workspace/shared-components',
        type: 'module'
      }));

      // Verify both structures exist and don't interfere
      expect(tree.exists('apps/my-app/src/pages/app-page.astro')).toBe(true);
      expect(tree.exists('packages/shared-components/src/Button.astro')).toBe(true);
      expect(tree.exists('packages/shared-components/package.json')).toBe(true);

      // Verify no cross-contamination
      expect(tree.exists('apps/shared-components')).toBe(false);
      expect(tree.exists('packages/my-app')).toBe(false);
    });

    test('should support monorepo structure with multiple app types', async () => {
      const projects = [
        { name: 'main-website', type: 'marketing' },
        { name: 'blog-app', type: 'content' },
        { name: 'admin-dashboard', type: 'application' },
        { name: 'docs-site', type: 'documentation' }
      ];

      for (const project of projects) {
        const options: AstroFileGeneratorSchema = {
          name: 'index',
          project: project.name,
          kind: 'page',
          ext: 'astro',
          skipFormat: true
        };

        await astroFileGenerator(tree, options);

        // Each project should have its own structure
        expect(tree.exists(`apps/${project.name}/src/pages/index.astro`)).toBe(true);
      }

      // Verify all projects coexist independently
      const allFiles = tree.listChanges();
      const appFiles = allFiles.filter(file => file.path.startsWith('apps/'));
      
      // Should have files for all projects
      expect(appFiles.length).toBeGreaterThanOrEqual(projects.length);
      
      // Each project should have its own directory
      projects.forEach(project => {
        const projectFiles = appFiles.filter(file => file.path.startsWith(`apps/${project.name}/`));
        expect(projectFiles.length).toBeGreaterThan(0);
      });
    });

    test('should handle workspace with existing non-Astro apps', async () => {
      // Simulate existing non-Astro apps in the workspace
      tree.write('apps/react-app/package.json', JSON.stringify({
        name: 'react-app',
        dependencies: { react: '^18.0.0' }
      }));
      tree.write('apps/react-app/src/App.jsx', 'export default function App() { return <div>React App</div>; }');

      tree.write('apps/vue-app/package.json', JSON.stringify({
        name: 'vue-app',
        dependencies: { vue: '^3.0.0' }
      }));
      tree.write('apps/vue-app/src/App.vue', '<template><div>Vue App</div></template>');

      // Create new Astro app
      const astroOptions: AstroFileGeneratorSchema = {
        name: 'home',
        project: 'astro-app',
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, astroOptions);

      // Verify all apps coexist
      expect(tree.exists('apps/react-app/src/App.jsx')).toBe(true);
      expect(tree.exists('apps/vue-app/src/App.vue')).toBe(true);
      expect(tree.exists('apps/astro-app/src/pages/home.astro')).toBe(true);

      // Verify no interference
      expect(tree.read('apps/react-app/src/App.jsx', 'utf-8')).toContain('React App');
      expect(tree.read('apps/vue-app/src/App.vue', 'utf-8')).toContain('Vue App');
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from partial directory creation', async () => {
      const projectName = 'recovery-test';
      
      // Simulate partial directory structure
      ensureTreeDirs(tree, `apps/${projectName}/src`);
      tree.write(`apps/${projectName}/src/.gitkeep`, ''); // Simulate incomplete setup

      // Generator should complete the structure
      const options: AstroFileGeneratorSchema = {
        name: 'recovered-page',
        project: projectName,
        kind: 'page',
        ext: 'astro',
        skipFormat: true
      };

      await astroFileGenerator(tree, options);

      // Should successfully create the page
      expect(tree.exists(`apps/${projectName}/src/pages/recovered-page.astro`)).toBe(true);
      
      // .gitkeep should still exist if it was there originally
      expect(tree.exists(`apps/${projectName}/src/.gitkeep`)).toBe(true);
    });

    test('should handle invalid directory names gracefully', async () => {
      const projectName = 'invalid-chars-test';
      
      // These should be handled without errors
      const problematicNames = [
        'component with spaces',
        'component/with/slashes',
        'component\\with\\backslashes',
        ''  // empty name
      ];

      for (const name of problematicNames) {
        if (name.trim() === '') continue; // Skip empty names as they should be validated earlier
        
        const options: AstroFileGeneratorSchema = {
          name: name,
          project: projectName,
          kind: 'component',
          ext: 'astro',
          skipFormat: true
        };

        // Should not throw errors
        await expect(astroFileGenerator(tree, options)).resolves.toBeDefined();
      }
    });

    test('should maintain file system integrity during bulk operations', async () => {
      const projectNames = Array.from({ length: 10 }, (_, i) => `bulk-app-${i}`);
      
      const bulkOptions: AstroFileGeneratorSchema = {
        name: 'bulk-page',
        project: '',
        kind: 'page',
        ext: 'astro',
        bulk: true,
        projects: projectNames,
        skipFormat: true
      };

      await astroFileGenerator(tree, bulkOptions);

      // Verify all projects were created successfully
      projectNames.forEach(projectName => {
        expect(tree.exists(`apps/${projectName}/src/pages/bulk-page.astro`)).toBe(true);
      });

      // Verify no corruption or cross-project contamination
      const allFiles = tree.listChanges();
      const pageFiles = allFiles.filter(file => file.path.endsWith('bulk-page.astro'));
      
      expect(pageFiles.length).toBe(projectNames.length);
      
      // Each file should be in its correct project directory
      pageFiles.forEach(file => {
        const projectName = file.path.split('/')[1];
        expect(projectNames).toContain(projectName);
      });
    });
  });
});
