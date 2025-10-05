import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import runExecutor from './executor.js';

vi.mock('execa');
vi.mock('../../utils/pm.js', () => ({
  resolveAstroBinary: vi.fn(),
}));

import { resolveAstroBinary } from '../../utils/pm.js';

describe('build executor', () => {
  const mockExeca = vi.mocked(execa);
  const mockResolveAstroBinary = vi.mocked(resolveAstroBinary);

  const mockContext: ExecutorContext = {
    root: '/workspace',
    projectName: 'test-app',
    projectsConfigurations: {
      version: 2,
      projects: {
        'test-app': {
          root: 'apps/test-app',
        },
      },
    },
  } as unknown as ExecutorContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully build project with default options', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(true);
    expect(mockResolveAstroBinary).toHaveBeenCalled();
    const [projectRoot, workspaceRoot, allowGlobal] = mockResolveAstroBinary.mock.calls[0];
    expect(projectRoot.replace(/\\/g, '/')).toBe('/workspace/apps/test-app');
    expect(workspaceRoot).toBe('/workspace');
    expect(allowGlobal).toBe(false);
    const [bin, args, opts] = mockExeca.mock.calls[0];
    expect(bin).toBe('/workspace/node_modules/.bin/astro');
    expect(args).toEqual(['build']);
    expect(opts.cwd.replace(/\\/g, '/')).toBe('/workspace/apps/test-app');
    expect(opts.stdio).toBe('inherit');
  });

  it('should use binOverride if provided', async () => {
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({ binOverride: '/custom/astro' }, mockContext);

    expect(result.success).toBe(true);
    expect(mockResolveAstroBinary).not.toHaveBeenCalled();
    expect(mockExeca).toHaveBeenCalledWith(
      '/custom/astro',
      ['build'],
      expect.any(Object)
    );
  });

  it('should pass config option to astro command', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({ config: 'custom.config.ts' }, mockContext);

    expect(result.success).toBe(true);
    expect(mockExeca).toHaveBeenCalledWith(
      '/workspace/node_modules/.bin/astro',
      ['build', '--config', 'custom.config.ts'],
      expect.any(Object)
    );
  });

  it('should pass additional args', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({ args: ['--verbose', '--silent'] }, mockContext);

    expect(result.success).toBe(true);
    expect(mockExeca).toHaveBeenCalledWith(
      '/workspace/node_modules/.bin/astro',
      ['build', '--verbose', '--silent'],
      expect.any(Object)
    );
  });

  it('should respect allowGlobal option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/usr/local/bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({ allowGlobal: true }, mockContext);

    expect(result.success).toBe(true);
    expect(mockResolveAstroBinary).toHaveBeenCalled();
    const [projectRoot, workspaceRoot, allowGlobal] = mockResolveAstroBinary.mock.calls[0];
    expect(projectRoot.replace(/\\/g, '/')).toBe('/workspace/apps/test-app');
    expect(workspaceRoot).toBe('/workspace');
    expect(allowGlobal).toBe(true);
  });

  it('should default allowGlobal to false', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({}, mockContext);

    expect(mockResolveAstroBinary).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      false
    );
  });

  it('should return failure if resolveAstroBinary throws', async () => {
    mockResolveAstroBinary.mockRejectedValue(new Error('Astro is not installed'));
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Astro is not installed');
    expect(mockExeca).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should return failure if execa throws', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockRejectedValue(new Error('Build failed'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
  });

  it('should throw error if projectName is missing', async () => {
    const contextWithoutProject = {
      ...mockContext,
      projectName: undefined,
    } as unknown as ExecutorContext;

    await expect(runExecutor({}, contextWithoutProject)).rejects.toThrow(
      'Project name is required but was not found in executor context'
    );
  });

  it('should handle context without projectsConfigurations', async () => {
    const contextNoConfig: ExecutorContext = {
      root: '/workspace',
      projectName: 'test-app',
      projectsConfigurations: undefined as unknown as ExecutorContext['projectsConfigurations'],
    } as unknown as ExecutorContext;

    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok2 = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok2);

    const result = await runExecutor({}, contextNoConfig);

    expect(result.success).toBe(true);
    // Should fallback to workspace root
    expect(mockResolveAstroBinary).toHaveBeenCalledWith(
      '/workspace',
      '/workspace',
      false
    );
  });

  it('should combine config and additional args correctly', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok3 = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok3);

    const result = await runExecutor(
      {
        config: 'custom.config.ts',
        args: ['--verbose'],
      },
      mockContext
    );

    expect(result.success).toBe(true);
    expect(mockExeca).toHaveBeenCalledWith(
      '/workspace/node_modules/.bin/astro',
      ['build', '--config', 'custom.config.ts', '--verbose'],
      expect.any(Object)
    );
  });
});
