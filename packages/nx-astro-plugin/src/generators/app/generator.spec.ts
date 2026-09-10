import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Tree } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    formatFiles: vi.fn(),
    generateFiles: vi.fn(),
    installPackagesTask: vi.fn(),
    updateJson: vi.fn(),
  };
});

describe('app generator', () => {
  let tree: Tree;
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockGenerateFiles = vi.mocked(devkit.generateFiles);
  const mockInstallPackagesTask = vi.mocked(devkit.installPackagesTask);
  const mockUpdateJson = vi.mocked(devkit.updateJson);
  const writeMock = vi.fn<[string, string], void>();

  beforeEach(() => {
    tree = {
      root: '/workspace',
      exists: vi.fn().mockReturnValue(false),
      write: writeMock,
      read: vi.fn().mockReturnValue(null),
      delete: vi.fn(),
    } as unknown as Tree;
    vi.clearAllMocks();
    mockInstallPackagesTask.mockReturnValue(undefined);
  });

  it('generates the application in the Nx tree without running an external scaffold', async () => {
    const task = await generator(tree, { name: 'test-app' });

    expect(mockGenerateFiles).toHaveBeenCalledWith(
      tree,
      expect.stringContaining('templates'),
      'apps/test-app',
      expect.objectContaining({ name: 'test-app' }),
    );
    expect(task).toBeInstanceOf(Function);
    expect(mockFormatFiles).toHaveBeenCalledWith(tree);
  });

  it('supports a custom directory and writes the Nx project configuration', async () => {
    await generator(tree, {
      name: 'test-app',
      directory: 'packages',
      skipInstall: true,
    });

    const projectCall = writeMock.mock.calls.find(([path]) =>
      path.includes('project.json'),
    );
    expect(projectCall).toBeDefined();
    expect(projectCall?.[0].replace(/\\/g, '/')).toContain(
      'packages/test-app/project.json',
    );

    const projectJson = JSON.parse(projectCall?.[1] ?? '{}');
    expect(projectJson.targets).toMatchObject({
      dev: { executor: '@forastro/nx-astro-plugin:dev' },
      build: { executor: '@forastro/nx-astro-plugin:build' },
      preview: { executor: '@forastro/nx-astro-plugin:preview' },
      check: { executor: '@forastro/nx-astro-plugin:check' },
      sync: { executor: '@forastro/nx-astro-plugin:sync' },
    });
  });

  it('adds integrations and package metadata in the tree', async () => {
    tree.exists = vi
      .fn()
      .mockImplementation((path: string) => path.endsWith('package.json'));
    tree.read = vi
      .fn()
      .mockImplementation((path: string) =>
        path.endsWith('package.json') ? '{}' : null,
      );

    await generator(tree, {
      name: 'test-app',
      integrations: ['mdx', 'react'],
      eslint: 'true',
      skipInstall: true,
    });

    const configCall = writeMock.mock.calls.find(([path]) =>
      path.endsWith('astro.config.ts'),
    );
    expect(configCall?.[1]).toContain("from '@astrojs/mdx'");
    expect(configCall?.[1]).toContain('mdxIntegration()');
    expect(configCall?.[1]).toContain('reactIntegration()');

    expect(mockUpdateJson).toHaveBeenCalledWith(
      tree,
      expect.stringContaining('package.json'),
      expect.any(Function),
    );
    const updateCallback = mockUpdateJson.mock.calls[0]?.[2];
    const result = updateCallback?.({ devDependencies: {} });
    expect(result).toMatchObject({
      name: 'test-app',
      private: true,
      dependencies: { '@astrojs/mdx': '^1.0.0', '@astrojs/react': '^1.0.0' },
      devDependencies: {
        astro: '^7.3.2',
        eslint: '^9.33.0',
        'eslint-plugin-astro': '^1.3.1',
      },
    });
  });

  it('does not install packages when skipInstall is enabled', async () => {
    await generator(tree, { name: 'test-app', skipInstall: true });

    expect(mockInstallPackagesTask).not.toHaveBeenCalled();
  });

  it('preserves an existing Astro version', async () => {
    tree.exists = vi
      .fn()
      .mockImplementation((path: string) => path.endsWith('package.json'));
    tree.read = vi.fn().mockReturnValue('{}');

    await generator(tree, { name: 'test-app', skipInstall: true });

    const updateCallback = mockUpdateJson.mock.calls[0]?.[2];
    const result = updateCallback?.({ devDependencies: { astro: '^4.0.0' } });
    expect(result?.devDependencies?.astro).toBe('^4.0.0');
  });
});
