import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import runExecutor from './executor.js';

vi.mock('execa');
vi.mock('../../utils/pm.js', () => ({
  resolveAstroBinary: vi.fn(),
}));

import { resolveAstroBinary } from '../../utils/pm.js';

describe('preview executor', () => {
  const mockExeca = vi.mocked(execa);
  const mockResolveAstroBinary = vi.mocked(resolveAstroBinary);

  const mockContext: ExecutorContext = {
    root: '/workspace',
    projectName: 'test-app',
    projectsConfigurations: {
      version: 2,
      projects: {
        'test-app': { root: 'apps/test-app' },
      },
    },
  } as unknown as ExecutorContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run preview with default options', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(true);
    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('preview');
  });

  it('should pass port option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ port: 4322 }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--port');
    expect(args).toContain('4322');
  });

  it('should pass host option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ host: '0.0.0.0' }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--host');
    expect(args).toContain('0.0.0.0');
  });

  it('should pass additional args', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ args: ['--open', '--verbose'] }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--open');
    expect(args).toContain('--verbose');
  });

  it('should use binOverride if provided', async () => {
    const customBin = '/custom/path/to/astro';
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ binOverride: customBin }, mockContext);

    expect(mockResolveAstroBinary).not.toHaveBeenCalled();
    const [bin] = mockExeca.mock.calls[0];
    expect(bin).toBe(customBin);
  });

  it('should return failure when binary resolution fails', async () => {
    mockResolveAstroBinary.mockRejectedValue(new Error('Astro binary not found'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
    expect(mockExeca).not.toHaveBeenCalled();
  });

  it('should return failure when preview command fails', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockRejectedValue(new Error('Preview failed'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
  });
});
