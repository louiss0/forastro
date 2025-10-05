import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as pm from '../../utils/pm.js';
import type { PackageManager } from '../../utils/pm.js';
import type { ProjectConfiguration } from '@nx/devkit';
import { execa } from 'execa';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
  };
});

vi.mock('../../utils/pm.js', () => ({
  detectPackageManager: vi.fn(),
  getExecFor: vi.fn(),
}));

vi.mock('execa');

describe('add-integration generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(devkit.readProjectConfiguration);
  const mockDetectPackageManager = pm.detectPackageManager as unknown as vi.MockedFunction<(
    projectRoot: string,
    workspaceRoot: string
  ) => PackageManager | Promise<PackageManager>>;
  const mockGetExecFor = pm.getExecFor as unknown as vi.MockedFunction<(
    manager: PackageManager
  ) => { npx: string; runner: string[] }>;
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    tree = {
      root: '/workspace',
      exists: vi.fn<[string], boolean>().mockReturnValue(true) as unknown as Tree['exists'],
      write: vi.fn<[string, string], void>() as unknown as Tree['write'],
      read: vi.fn<[string, string?], string | null>() as unknown as Tree['read'],
    } as unknown as Tree;
    vi.clearAllMocks();

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/test-app',
      name: 'test-app',
    } as unknown as ProjectConfiguration);

    mockDetectPackageManager.mockReturnValue('pnpm');
    mockGetExecFor.mockReturnValue({
      npx: 'pnpm',
      runner: ['dlx'],
    });
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);
  });

  it('should add single integration to project', async () => {
    await generator(tree, {
      project: 'test-app',
      names: ['react'],
    });

    expect(mockReadProjectConfiguration).toHaveBeenCalledWith(tree, 'test-app');
    expect(mockDetectPackageManager).toHaveBeenCalled();
    expect(mockExeca).toHaveBeenCalledWith(
      'pnpm',
      ['dlx', 'astro', 'add', 'react', '--yes'],
      expect.objectContaining({
        cwd: 'apps/test-app',
        stdio: 'inherit',
      })
    );
  });

  it('should add multiple integrations to project', async () => {
    await generator(tree, {
      project: 'test-app',
      names: ['react', 'vue', 'tailwind'],
    });

    expect(mockExeca).toHaveBeenCalledTimes(3);
    expect(mockExeca).toHaveBeenCalledWith(
      'pnpm',
      ['dlx', 'astro', 'add', 'react', '--yes'],
      expect.any(Object)
    );
    expect(mockExeca).toHaveBeenCalledWith(
      'pnpm',
      ['dlx', 'astro', 'add', 'vue', '--yes'],
      expect.any(Object)
    );
    expect(mockExeca).toHaveBeenCalledWith(
      'pnpm',
      ['dlx', 'astro', 'add', 'tailwind', '--yes'],
      expect.any(Object)
    );
  });

  it('should work with npm package manager', async () => {
    mockDetectPackageManager.mockReturnValue('npm');
    mockGetExecFor.mockReturnValue({
      npx: 'npx',
      runner: [],
    });

    await generator(tree, {
      project: 'test-app',
      names: ['mdx'],
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      ['astro', 'add', 'mdx', '--yes'],
      expect.any(Object)
    );
  });

  it('should use correct project root from configuration', async () => {
    mockReadProjectConfiguration.mockReturnValue({
      root: 'packages/my-astro-app',
      name: 'my-astro-app',
    } as unknown as ProjectConfiguration);

    await generator(tree, {
      project: 'my-astro-app',
      names: ['node'],
    });

    expect(mockExeca).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({
        cwd: 'packages/my-astro-app',
      })
    );
  });

  it('should handle empty runner array', async () => {
    mockGetExecFor.mockReturnValue({
      npx: 'npm',
      runner: [],
    });

    await generator(tree, {
      project: 'test-app',
      names: ['vercel'],
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'npm',
      ['astro', 'add', 'vercel', '--yes'],
      expect.any(Object)
    );
  });
});
