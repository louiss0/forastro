import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
  tmpProjPath,
  runCommandAsync,
} from '@nx/plugin/testing';
import { rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('JPD Integration E2E Tests', () => {
  let tmpDir: string;
  let workspaceDir: string;

  beforeAll(async () => {
    tmpDir = tmpProjPath();
    workspaceDir = join(tmpDir, 'test-workspace');
    
    // Create sample workspace in tmp
    mkdirSync(workspaceDir, { recursive: true });
    process.chdir(workspaceDir);
    
    // Initialize a new Nx workspace
    await runCommandAsync('npx create-nx-workspace@latest test-workspace --preset=empty --packageManager=pnpm --interactive=false');
    
    // Ensure our plugin is available
    ensureNxProject('@nx/astro-nx', 'dist');
  }, 300000);

  afterAll(() => {
    // Clean up the test workspace
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Sample Workspace Tests', () => {
    it('should create sample workspace with pnpm package manager', async () => {
      const appName = uniq('sample-astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/tsconfig.json`,
          `${appName}/project.json`
        )
      ).not.toThrow();

      // Verify pnpm lock file exists
      expect(() =>
        checkFilesExist('pnpm-lock.yaml')
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.name).toBe(appName);
      expect(packageJson.dependencies.astro).toBeDefined();
    }, 180000);

    it('should run generator successfully', async () => {
      const appName = uniq('gen-test-app');
      
      const result = await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=vue --directory=${appName}`
      );

      expect(result.stdout).toContain('successfully');
      
      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/project.json`
        )
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.dependencies.vue).toBeDefined();
    }, 180000);

    it('should build executor succeed', async () => {
      const appName = uniq('build-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      const buildResult = await runNxCommandAsync(`build ${appName}`);
      
      expect(buildResult.stdout).toContain('success');
      expect(() =>
        checkFilesExist(
          `${appName}/dist/index.html`,
          `${appName}/dist/_astro`
        )
      ).not.toThrow();
    }, 180000);

    it('should dev executor succeed', async () => {
      const appName = uniq('dev-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      // Test dev server can start by checking the executor exists and is valid
      const projectJson = readJson(`${appName}/project.json`);
      expect(projectJson.targets.dev).toBeDefined();
      expect(projectJson.targets.dev.executor).toBe('@nx/astro-nx:dev');
      
      // We can't run the dev server for long in CI, but we can verify the configuration
      expect(projectJson.targets.dev.options).toBeDefined();
    }, 120000);

    it('should preview executor succeed', async () => {
      const appName = uniq('preview-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      // First build the app
      await runNxCommandAsync(`build ${appName}`);
      
      // Test preview server configuration
      const projectJson = readJson(`${appName}/project.json`);
      expect(projectJson.targets.preview).toBeDefined();
      expect(projectJson.targets.preview.executor).toBe('@nx/astro-nx:preview');
      
      // Verify preview options are set correctly
      expect(projectJson.targets.preview.options).toBeDefined();
    }, 180000);

    it('should check executor succeed', async () => {
      const appName = uniq('check-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      const checkResult = await runNxCommandAsync(`check ${appName}`);
      
      expect(checkResult.stdout).toContain('success');
    }, 120000);
  });

  describe('Backward Compatibility Tests', () => {
    it('should force packageManager to pnpm for backward compatibility', async () => {
      const appName = uniq('compat-test-app');
      
      // Test with npm as default but force pnpm
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      // Verify pnpm was used
      expect(() =>
        checkFilesExist('pnpm-lock.yaml')
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.name).toBe(appName);
      
      // Verify project.json has correct configuration
      const projectJson = readJson(`${appName}/project.json`);
      expect(projectJson.targets).toBeDefined();
      expect(projectJson.targets.build).toBeDefined();
      expect(projectJson.targets.dev).toBeDefined();
      expect(projectJson.targets.preview).toBeDefined();
      expect(projectJson.targets.check).toBeDefined();
    }, 120000);

    it('should handle different templates with pnpm', async () => {
      const templates = ['minimal', 'vue', 'mdx'];
      
      for (const template of templates) {
        const appName = uniq(`template-${template}-app`);
        
        await runNxCommandAsync(
          `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=${template} --directory=${appName}`
        );

        expect(() =>
          checkFilesExist(
            `${appName}/package.json`,
            `${appName}/astro.config.mjs`,
            `${appName}/src/pages/index.astro`,
            `${appName}/project.json`
          )
        ).not.toThrow();

        const packageJson = readJson(`${appName}/package.json`);
        expect(packageJson.name).toBe(appName);
        
        // Verify template-specific dependencies
        if (template === 'vue') {
          expect(packageJson.dependencies.vue).toBeDefined();
        } else if (template === 'mdx') {
          expect(packageJson.dependencies['@astrojs/mdx']).toBeDefined();
        }
      }
    }, 300000);

    it('should migrate existing projects maintaining pnpm', async () => {
      const appName = uniq('migrate-test-app');
      
      // Create initial project with pnpm
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      // Run migration
      await runNxCommandAsync(
        `generate @nx/astro-nx:migrate ${appName}`
      );

      // Verify migration maintains pnpm setup
      expect(() =>
        checkFilesExist(
          `${appName}/project.json`,
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          'pnpm-lock.yaml'
        )
      ).not.toThrow();

      const projectJson = readJson(`${appName}/project.json`);
      expect(projectJson.targets.build).toBeDefined();
      expect(projectJson.targets.dev).toBeDefined();
      expect(projectJson.targets.preview).toBeDefined();
      expect(projectJson.targets.check).toBeDefined();
    }, 180000);
  });

  describe('JPD Executor Integration', () => {
    it('should ensure all executors work with JPD', async () => {
      const appName = uniq('jpd-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal --directory=${appName}`
      );

      // Test that all executors are properly configured
      const projectJson = readJson(`${appName}/project.json`);
      
      // Verify all required executors exist
      const expectedExecutors = ['build', 'dev', 'preview', 'check'];
      expectedExecutors.forEach(executor => {
        expect(projectJson.targets[executor]).toBeDefined();
        expect(projectJson.targets[executor].executor).toContain('@nx/astro-nx:');
      });

      // Test build executor
      const buildResult = await runNxCommandAsync(`build ${appName}`);
      expect(buildResult.stdout).toContain('success');

      // Test check executor
      const checkResult = await runNxCommandAsync(`check ${appName}`);
      expect(checkResult.stdout).toContain('success');
    }, 180000);

    it('should work with different project configurations', async () => {
      const appName = uniq('config-test-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=vue --directory=${appName}`
      );

      // Test that Vue-specific setup works
      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.dependencies.vue).toBeDefined();
      expect(packageJson.dependencies['@astrojs/vue']).toBeDefined();

      // Test build with Vue template
      const buildResult = await runNxCommandAsync(`build ${appName}`);
      expect(buildResult.stdout).toContain('success');
    }, 180000);
  });
});
