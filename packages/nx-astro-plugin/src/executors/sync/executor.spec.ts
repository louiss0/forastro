import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import runExecutor from './executor.js';

vi.mock('execa');
vi.mock('../../utils/pm.js', () => ({
  resolveAstroBinary: vi.fn(),
}));

import { resolveAstroBinary } from '../../utils/pm.js';

describe('sync executor', () => {
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

  it('should run sync with default options', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(true);
    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('sync');
  });

  it('should pass config option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ config: './custom-astro.config.mjs' }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--config');
    expect(args).toContain('./custom-astro.config.mjs');
  });

  it('should pass verbose option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ verbose: true }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--verbose');
  });

  it('should pass additional args', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ args: ['--force'] }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--force');
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

  it('should return failure on error', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockRejectedValue(new Error('Sync failed'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
  });
});
