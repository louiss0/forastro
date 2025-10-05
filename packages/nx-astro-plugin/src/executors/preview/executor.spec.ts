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
});
