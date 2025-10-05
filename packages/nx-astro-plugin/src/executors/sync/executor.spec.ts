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
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run sync with default options', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockResolvedValue({} as any);

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(true);
    const [, args] = mockExeca.mock.calls[0];
    expect(args).toContain('sync');
  });

  it('should return failure on error', async () => {
    mockResolveAstroBinary.mockResolvedValue('/workspace/node_modules/.bin/astro');
    mockExeca.mockRejectedValue(new Error('Sync failed'));

    const result = await runExecutor({}, mockContext);

    expect(result.success).toBe(false);
  });
});
