import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    formatFiles: vi.fn(),
  };
});

describe('collection-schema generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(devkit.readProjectConfiguration);
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const writeSpy = vi.fn<[string, string], void>();

  beforeEach(() => {
    writeSpy.mockReset();
    tree = {
      root: '/workspace',
      exists: vi.fn<[string], boolean>().mockReturnValue(false) as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<[string, string?], string | null>() as unknown as Tree['read'],
    } as unknown as Tree;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/site',
      name: 'site',
    } as unknown as ProjectConfiguration);
  });

  it('creates content collection config at src/content/<name>/config.ts', async () => {
    await generator(tree, { project: 'site', name: 'posts' });

    const call = writeSpy.mock.calls[0];
    const path = call[0].replace(/\\/g, '/');
    expect(path).toContain('apps/site/src/content/posts/config.ts');
    expect(mockFormatFiles).toHaveBeenCalled();
  });
});