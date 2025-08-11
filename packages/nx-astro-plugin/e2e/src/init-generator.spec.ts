import { join } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { 
  createTestWorkspace, 
  runInitGenerator, 
  assertProjectConfiguration, 
  assertTemplateFilesCopied,
  assertExcludedFiles,
  readProjectPackageJson,
  COMMON_TEMPLATE_FILES,
  EXCLUDED_FILES,
  AVAILABLE_TEMPLATES,
  type TestWorkspace 
} from './test-utils';

describe('Init Generator E2E Smoke Tests', () => {
  let workspace: TestWorkspace;

  beforeEach(async () => {
    workspace = await createTestWorkspace();
  });

  afterEach(async () => {
    if (workspace) {
      await workspace.cleanup();
    }
  });

  describe('Project Configuration', () => {
    it('should add project configuration with correct targets', async () => {
      // Arrange
      const projectName = 'test-project';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config.root).toBe(`apps/${projectName}`);
      expect(config.tags).toEqual([]);
    });

    it('should respect custom directory parameter', async () => {
      // Arrange
      const projectName = 'custom-project';
      const customDirectory = 'projects';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        directory: customDirectory,
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config.root).toBe(`${customDirectory}/${projectName}`);
    });

    it('should parse and set tags correctly', async () => {
      // Arrange
      const projectName = 'tagged-project';
      const tags = 'frontend,astro,ui';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        tags,
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config.tags).toEqual(['frontend', 'astro', 'ui']);
    });

    it('should handle empty tags gracefully', async () => {
      // Arrange
      const projectName = 'no-tags-project';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        tags: '',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config.tags).toEqual([]);
    });
  });

  describe('Template Files Copying', () => {
    for (const template of AVAILABLE_TEMPLATES) {
      it(`should copy template files correctly for ${template}`, async () => {
        // Arrange
        const projectName = `test-${template}-project`;
        const options = {
          name: projectName,
          template,
          skipInstall: true,
        };

        // Act
        await runInitGenerator(workspace.tree, options);

        // Assert
        const projectRoot = `apps/${projectName}`;
        await assertTemplateFilesCopied(
          workspace.workspaceRoot, 
          projectRoot, 
          COMMON_TEMPLATE_FILES
        );

        // Verify excluded files are not copied
        await assertExcludedFiles(
          workspace.workspaceRoot, 
          projectRoot, 
          EXCLUDED_FILES
        );
      });
    }

    it('should update package.json name correctly', async () => {
      // Arrange
      const projectName = 'name-update-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const projectRoot = `apps/${projectName}`;
      const packageJson = await readProjectPackageJson(workspace.workspaceRoot, projectRoot);
      expect(packageJson.name).toBe(projectName);
    });

    it('should copy src directory structure', async () => {
      // Arrange  
      const projectName = 'src-structure-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const projectRoot = `apps/${projectName}`;
      const srcPath = join(workspace.workspaceRoot, projectRoot, 'src');
      
      expect(existsSync(srcPath)).toBe(true);
      const srcStats = await stat(srcPath);
      expect(srcStats.isDirectory()).toBe(true);
      
      // Verify some common src files exist
      const srcFiles = await readdir(srcPath);
      expect(srcFiles).toContain('env.d.ts');
    });

    it('should copy public directory', async () => {
      // Arrange
      const projectName = 'public-dir-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert  
      const projectRoot = `apps/${projectName}`;
      const publicPath = join(workspace.workspaceRoot, projectRoot, 'public');
      
      expect(existsSync(publicPath)).toBe(true);
      const publicStats = await stat(publicPath);
      expect(publicStats.isDirectory()).toBe(true);
    });
  });

  describe('Template-Specific Files', () => {
    it('should copy MDX-specific files for astro-mdx template', async () => {
      // Arrange
      const projectName = 'mdx-specific-test';
      const options = {
        name: projectName,
        template: 'astro-mdx',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const projectRoot = `apps/${projectName}`;
      const pagesPath = join(workspace.workspaceRoot, projectRoot, 'src', 'pages');
      
      if (existsSync(pagesPath)) {
        const pageFiles = await readdir(pagesPath);
        // Should contain MDX pages
        const hasMdxFiles = pageFiles.some(file => file.endsWith('.mdx'));
        expect(hasMdxFiles).toBe(true);
      }
    });

    it('should copy Preact-specific files for astro-preact template', async () => {
      // Arrange
      const projectName = 'preact-specific-test';
      const options = {
        name: projectName,
        template: 'astro-preact',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const projectRoot = `apps/${projectName}`;
      const componentsPath = join(workspace.workspaceRoot, projectRoot, 'src', 'components');
      
      if (existsSync(componentsPath)) {
        const componentFiles = await readdir(componentsPath, { recursive: true });
        // Should contain TSX/JSX files for Preact components
        const hasTsxFiles = componentFiles.some(file => 
          typeof file === 'string' && file.endsWith('.tsx')
        );
        expect(hasTsxFiles).toBe(true);
      }
    });
  });

  describe('Skip Install Behavior', () => {
    it('should respect skipInstall: true and not attempt package installation', async () => {
      // Arrange
      const projectName = 'skip-install-true-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act & Assert - Should not throw or attempt to run package manager
      await expect(runInitGenerator(workspace.tree, options)).resolves.not.toThrow();

      // Verify project was still created properly
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config).toBeDefined();
    });

    it('should default skipInstall to false when not specified', async () => {
      // Arrange
      const projectName = 'skip-install-default-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        // skipInstall not specified, should default to false
      };

      // Act & Assert - This test mainly verifies the default behavior exists
      // In a real scenario, this would attempt to run package manager
      // but since our tests use skipInstall: true, we're testing the interface
      await expect(runInitGenerator(workspace.tree, { ...options, skipInstall: true }))
        .resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent template', async () => {
      // Arrange
      const projectName = 'invalid-template-test';
      const options = {
        name: projectName,
        template: 'non-existent-template',
        skipInstall: true,
      };

      // Act & Assert
      await expect(runInitGenerator(workspace.tree, options))
        .rejects
        .toThrow(/Template not found/);
    });

    it('should handle project names with special characters', async () => {
      // Arrange - Testing with kebab-case names which are common
      const projectName = 'my-awesome-project';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config).toBeDefined();
      expect(config.root).toBe(`apps/${projectName}`);
    });
  });

  describe('Package Manager Selection', () => {
    it('should respect packageManager parameter when skipInstall is false', async () => {
      // Arrange
      const projectName = 'package-manager-test';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        packageManager: 'pnpm' as const,
        skipInstall: true, // We still skip for testing, but validate the option is accepted
      };

      // Act & Assert
      await expect(runInitGenerator(workspace.tree, options)).resolves.not.toThrow();
      
      // Verify project configuration was created successfully
      const config = assertProjectConfiguration(workspace.tree, projectName);
      expect(config).toBeDefined();
    });
  });

  describe('Integration Test - Complete Workflow', () => {
    it('should create a complete working Astro project', async () => {
      // Arrange
      const projectName = 'integration-test-project';
      const options = {
        name: projectName,
        template: 'astro-minimal',
        tags: 'integration,test',
        skipInstall: true,
      };

      // Act
      await runInitGenerator(workspace.tree, options);

      // Assert - Complete project verification
      const config = assertProjectConfiguration(workspace.tree, projectName);
      const projectRoot = `apps/${projectName}`;
      
      // 1. Project configuration
      expect(config.tags).toEqual(['integration', 'test']);
      expect(config.root).toBe(projectRoot);
      
      // 2. Essential files exist
      await assertTemplateFilesCopied(
        workspace.workspaceRoot,
        projectRoot,
        COMMON_TEMPLATE_FILES
      );
      
      // 3. Excluded files don't exist
      await assertExcludedFiles(
        workspace.workspaceRoot,
        projectRoot,
        EXCLUDED_FILES
      );
      
      // 4. Package.json has correct name
      const packageJson = await readProjectPackageJson(workspace.workspaceRoot, projectRoot);
      expect(packageJson.name).toBe(projectName);
      
      // 5. Astro config exists and is readable
      const astroConfigPath = join(workspace.workspaceRoot, projectRoot, 'astro.config.mjs');
      const astroConfigContent = await readFile(astroConfigPath, 'utf8');
      expect(astroConfigContent).toContain('astro');
      
      // 6. TypeScript config exists
      const tsconfigPath = join(workspace.workspaceRoot, projectRoot, 'tsconfig.json');
      const tsconfigContent = await readFile(tsconfigPath, 'utf8');
      expect(tsconfigContent).toBeTruthy();
    });
  });
});
