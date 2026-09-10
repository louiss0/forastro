import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectConfiguration, Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import generator from './generator.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    formatFiles: vi.fn(),
    installPackagesTask: vi.fn(),
    readProjectConfiguration: vi.fn(),
    updateJson: vi.fn(),
  };
});

describe('add-integration generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(
    devkit.readProjectConfiguration,
  );
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockInstallPackagesTask = vi.mocked(devkit.installPackagesTask);
  const mockUpdateJson = vi.mocked(devkit.updateJson);

  beforeEach(() => {
    tree = {
      exists: vi.fn().mockReturnValue(true),
      write: vi.fn(),
      read: vi
        .fn()
        .mockImplementation((path: string) =>
          path.endsWith('astro.config.ts')
            ? "import { defineConfig } from 'astro/config';\n\nexport default defineConfig({});\n"
            : '{}',
        ),
    } as unknown as Tree;
    vi.clearAllMocks();
    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/test-app',
      name: 'test-app',
    } as ProjectConfiguration);
    mockInstallPackagesTask.mockReturnValue(undefined);
  });

  it('adds a single integration to the Astro config and package metadata', async () => {
    const task = await generator(tree, {
      project: 'test-app',
      names: ['react'],
    });

    expect(mockReadProjectConfiguration).toHaveBeenCalledWith(tree, 'test-app');
    expect(tree.write).toHaveBeenCalledWith(
      'apps/test-app/astro.config.ts',
      expect.stringContaining("import reactIntegration from '@astrojs/react';"),
    );
    const config = vi.mocked(tree.write).mock.calls[0]?.[1] as string;
    expect(config).toContain('integrations: [reactIntegration()]');
    expect(mockUpdateJson).toHaveBeenCalledWith(
      tree,
      'apps/test-app/package.json',
      expect.any(Function),
    );
    expect(task).toBeInstanceOf(Function);
    expect(mockFormatFiles).toHaveBeenCalledWith(tree);
  });

  it('deduplicates multiple integrations and updates the virtual package', async () => {
    await generator(tree, {
      project: 'test-app',
      names: ['react', 'vue', 'react'],
      skipInstall: true,
    });

    const config = vi.mocked(tree.write).mock.calls[0]?.[1] as string;
    expect(config.match(/Integration\(\)/g)).toHaveLength(2);
    const updateCallback = mockUpdateJson.mock.calls[0]?.[2];
    const result = updateCallback?.({});
    expect(result).toMatchObject({
      dependencies: {
        '@astrojs/react': '^1.0.0',
        '@astrojs/vue': '^1.0.0',
      },
    });
    expect(mockInstallPackagesTask).not.toHaveBeenCalled();
  });

  it('does not duplicate an integration already in the Astro config', async () => {
    vi.mocked(tree.read).mockImplementation((path: string) =>
      path.endsWith('astro.config.ts')
        ? "import React from '@astrojs/react';\n\nexport default defineConfig({ integrations: [React()] });\n"
        : '{}',
    );

    await generator(tree, {
      project: 'test-app',
      names: ['react'],
      skipInstall: true,
    });

    const config = vi.mocked(tree.write).mock.calls[0]?.[1] as string;
    expect(config.match(/React\(\)/g)).toHaveLength(1);
    expect(config).not.toContain('reactIntegration');
  });

  it('honors an explicit package manager for deferred installation', async () => {
    const task = await generator(tree, {
      project: 'test-app',
      names: ['mdx'],
      packageManager: 'npm',
    });

    task?.();
    expect(mockInstallPackagesTask).toHaveBeenCalledWith(
      tree,
      true,
      'apps/test-app',
      'npm',
    );
  });

  it('rejects an empty integration list', async () => {
    await expect(
      generator(tree, { project: 'test-app', names: [' ', ''] }),
    ).rejects.toThrow('At least one integration name is required');
  });
});
