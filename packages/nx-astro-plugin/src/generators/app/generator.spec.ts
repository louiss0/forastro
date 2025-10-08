import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import { execa } from 'execa';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    formatFiles: vi.fn(),
    generateFiles: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    updateJson: vi.fn(),
  };
});

vi.mock('execa');

describe('app generator', () => {
  let tree: Tree;
  const mockExeca = vi.mocked(execa);
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockGenerateFiles = vi.mocked(devkit.generateFiles);
  const mockUpdateJson = vi.mocked(devkit.updateJson);
  const writeMock = vi.fn<[string, string], void>();

  beforeEach(() => {
    tree = {
      root: '/workspace',
      exists: vi
        .fn<[string], boolean>()
        .mockReturnValue(false) as unknown as Tree['exists'],
      write: writeMock as unknown as Tree['write'],
      read: vi.fn<
        [string, string?],
        string | null
      >() as unknown as Tree['read'],
    } as unknown as Tree;
    vi.clearAllMocks();
  });

  it('should create project with copy-fixture offline strategy', async () => {
    await generator(tree, {
      name: 'test-app',
      offlineStrategy: 'copy-fixture',
    });

    expect(mockGenerateFiles).toHaveBeenCalled();
    expect(mockExeca).not.toHaveBeenCalled();
    expect(tree.write).toHaveBeenCalledWith(
      expect.stringContaining('project.json'),
      expect.stringContaining('test-app'),
    );
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should create project with npx create-astro by default', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining([
        'create-astro@latest',
        'apps/test-app',
        '--template',
        'minimal',
        '--yes',
      ]),
      expect.any(Object),
    );
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should use custom template when specified', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
      template: 'blog',
    });

    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['--template', 'blog']),
      expect.any(Object),
    );
  });

  it('should use custom directory', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
      directory: 'packages',
    });

    const writeCall = writeMock.mock.calls[0];
    const normalizedPath = writeCall[0].replace(/\\/g, '/');
    expect(normalizedPath).toContain('packages/test-app/project.json');
  });

  it('should write project.json with correct executors', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
    });

    const writeCall = writeMock.mock.calls.find((call) =>
      call[0].includes('project.json'),
    ) as [string, string] | undefined;
    expect(writeCall).toBeDefined();
    const projectJson = JSON.parse(writeCall[1]);
    expect(projectJson.targets).toHaveProperty('dev');
    expect(projectJson.targets).toHaveProperty('build');
    expect(projectJson.targets).toHaveProperty('preview');
    expect(projectJson.targets).toHaveProperty('check');
    expect(projectJson.targets).toHaveProperty('sync');
  });

  it('should update package.json when it exists', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);
    tree.exists = vi.fn().mockImplementation((path) => {
      return path.includes('package.json');
    });

    await generator(tree, {
      name: 'test-app',
    });

    expect(mockUpdateJson).toHaveBeenCalledWith(
      tree,
      expect.stringContaining('package.json'),
      expect.any(Function),
    );

    // Test the updateJson callback
    const updateCallback = mockUpdateJson.mock.calls[0][2];
    const pkg = { devDependencies: {} };
    const result = updateCallback(pkg);
    expect(result.nx).toBeDefined();
    expect(result.nx.name).toBe('test-app');
    expect(result.devDependencies.astro).toBe('^5.0.0');
  });

  it('should preserve existing astro devDependency', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);
    tree.exists = vi.fn().mockImplementation((path) => {
      return path.includes('package.json');
    });

    await generator(tree, {
      name: 'test-app',
    });

    // Test the updateJson callback with existing astro
    const updateCallback = mockUpdateJson.mock.calls[0][2];
    const pkg = { devDependencies: { astro: '^4.0.0' } };
    const result = updateCallback(pkg);
    expect(result.devDependencies.astro).toBe('^4.0.0');
  });

  it('should use jpd when FORASTRO_PM=jpd and jpd is available', async () => {
    const originalEnv = process.env['FORASTRO_PM'];
    process.env['FORASTRO_PM'] = 'jpd';
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
    });

    // First call checks jpd --version
    expect(mockExeca).toHaveBeenNthCalledWith(
      1,
      'jpd',
      ['--version'],
      expect.objectContaining({ stdio: 'ignore' }),
    );
    // Second call uses jpd dlx
    expect(mockExeca).toHaveBeenNthCalledWith(
      2,
      'jpd',
      expect.arrayContaining(['dlx', 'create-astro@latest']),
      expect.any(Object),
    );

    process.env['FORASTRO_PM'] = originalEnv;
  });

  it('should use pnpm when FORASTRO_PM=pnpm and pnpm is available', async () => {
    const originalEnv = process.env['FORASTRO_PM'];
    process.env['FORASTRO_PM'] = 'pnpm';
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
    });

    // First call checks pnpm --version
    expect(mockExeca).toHaveBeenNthCalledWith(
      1,
      'pnpm',
      ['--version'],
      expect.objectContaining({ stdio: 'ignore' }),
    );
    // Second call uses pnpm dlx
    expect(mockExeca).toHaveBeenNthCalledWith(
      2,
      'pnpm',
      expect.arrayContaining(['dlx', 'create-astro@latest']),
      expect.any(Object),
    );

    process.env['FORASTRO_PM'] = originalEnv;
  });

  it('should fallback to npx when preferred PM is not available', async () => {
    const originalEnv = process.env['FORASTRO_PM'];
    process.env['FORASTRO_PM'] = 'jpd';
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca
      .mockRejectedValueOnce(new Error('jpd not found'))
      .mockResolvedValue(ok);

    await generator(tree, {
      name: 'test-app',
    });

    // Should fallback to npx
    expect(mockExeca).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['create-astro@latest']),
      expect.any(Object),
    );

    process.env['FORASTRO_PM'] = originalEnv;
  });
});
