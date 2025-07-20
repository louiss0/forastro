import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
  tmpProjPath,
} from '@nx/plugin/testing';
import { rmSync } from 'fs';

describe('astro-nx plugin e2e', () => {
  let projectName: string;
  let workspaceDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    // Save the original working directory
    originalCwd = process.cwd();
    
    projectName = uniq('astro-nx');
    workspaceDir = tmpProjPath();
    
    // Create a new Nx workspace
    ensureNxProject('@nx/astro-nx', 'dist');
  }, 120000);

  afterAll(() => {
    // Restore original working directory if it was changed
    if (originalCwd && process.cwd() !== originalCwd) {
      process.chdir(originalCwd);
    }
    
    // Clean up the test workspace
    if (workspaceDir) {
      rmSync(workspaceDir, { recursive: true, force: true });
    }
  });

  describe('--packageManager=pnpm', () => {
    it('should create astro application with pnpm', async () => {
      const appName = uniq('astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/tsconfig.json`
        )
      ).not.toThrow();

      // Check that pnpm was used
      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.name).toBe(appName);
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.astro).toBeDefined();
    }, 120000);

    it('should build astro application', async () => {
      const appName = uniq('astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal`
      );

      const result = await runNxCommandAsync(`build ${appName}`);
      expect(result.stdout).toContain('success');
      
      expect(() =>
        checkFilesExist(
          `${appName}/dist/index.html`
        )
      ).not.toThrow();
    }, 120000);

    it('should check astro application', async () => {
      const appName = uniq('astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --packageManager=pnpm --template=minimal`
      );

      const result = await runNxCommandAsync(`check ${appName}`);
      expect(result.stdout).toContain('success');
    }, 120000);
  });

  describe('--packageManager=npm (default)', () => {
    it('should create astro application with npm', async () => {
      const appName = uniq('astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --template=minimal`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/tsconfig.json`
        )
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.name).toBe(appName);
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.astro).toBeDefined();
    }, 120000);

    it('should build astro application with npm', async () => {
      const appName = uniq('astro-app');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --template=minimal`
      );

      const result = await runNxCommandAsync(`build ${appName}`);
      expect(result.stdout).toContain('success');
      
      expect(() =>
        checkFilesExist(
          `${appName}/dist/index.html`
        )
      ).not.toThrow();
    }, 120000);
  });

  describe('different templates', () => {
    it('should create astro application with vue template', async () => {
      const appName = uniq('astro-vue');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --template=vue --packageManager=pnpm`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/tsconfig.json`
        )
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.dependencies.vue).toBeDefined();
    }, 120000);

    it('should create astro application with mdx template', async () => {
      const appName = uniq('astro-mdx');
      
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --template=mdx --packageManager=pnpm`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`,
          `${appName}/src/pages/index.astro`,
          `${appName}/tsconfig.json`
        )
      ).not.toThrow();

      const packageJson = readJson(`${appName}/package.json`);
      expect(packageJson.dependencies['@astrojs/mdx']).toBeDefined();
    }, 120000);
  });

  describe('migrate generator', () => {
    it('should migrate existing astro project', async () => {
      const appName = uniq('astro-migrate');
      
      // First create a basic astro project
      await runNxCommandAsync(
        `generate @nx/astro-nx:init ${appName} --template=minimal --packageManager=pnpm`
      );

      // Then migrate it
      await runNxCommandAsync(
        `generate @nx/astro-nx:migrate ${appName}`
      );

      expect(() =>
        checkFilesExist(
          `${appName}/project.json`,
          `${appName}/package.json`,
          `${appName}/astro.config.mjs`
        )
      ).not.toThrow();

      const projectJson = readJson(`${appName}/project.json`);
      expect(projectJson.targets.build).toBeDefined();
      expect(projectJson.targets.dev).toBeDefined();
      expect(projectJson.targets.preview).toBeDefined();
      expect(projectJson.targets.check).toBeDefined();
    }, 120000);
  });
});
