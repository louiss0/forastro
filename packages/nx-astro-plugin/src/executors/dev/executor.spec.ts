import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import runExecutor from './executor.js';

vi.mock('execa');
vi.mock('../../utils/pm.js', () => ({
  resolveAstroBinary: vi.fn(),
}));

import { resolveAstroBinary } from '../../utils/pm.js';

describe('dev executor', () => {
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

  it('should run dev server with default options', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(true);
    const [, args] = mockExeca.mock.calls[0];
    expect(args).toEqual(['dev']);
  });

  it('should pass port option', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ port: 4321 }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--port');
    expect(args).toContain('4321');
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

  it('should pass open flag', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
    mockExeca.mockResolvedValue(ok);

    await runExecutor({ open: true }, mockContext);

    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('--open');
  });

  it('should return failure if execution fails', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockRejectedValue(new Error('Dev server failed'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
  });
});
