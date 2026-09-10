import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectConfiguration, Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import generator from './generator.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    formatFiles: vi.fn(),
    readProjectConfiguration: vi.fn(),
  };
});

describe('collection-schema generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(
    devkit.readProjectConfiguration,
  );
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const writeSpy = vi.fn<[string, string], void>();

  beforeEach(() => {
    writeSpy.mockReset();
    tree = {
      exists: vi.fn().mockReturnValue(false),
      write: writeSpy,
      read: vi.fn().mockReturnValue(null),
    } as unknown as Tree;
    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/site',
      name: 'site',
    } as ProjectConfiguration);
  });

  it('adds a collection to the central Astro 7 content config', async () => {
    await generator(tree, { project: 'site', name: 'posts' });

    const call = writeSpy.mock.calls[0];
    expect(call?.[0].replace(/\\/g, '/')).toBe(
      'apps/site/src/content.config.ts',
    );
    expect(call?.[1]).toContain('const posts = defineCollection');
    expect(call?.[1]).toContain("collections = { 'posts': posts }");
    expect(mockFormatFiles).toHaveBeenCalledWith(tree);
  });

  it('preserves existing collections and does not duplicate a collection', async () => {
    const existing =
      "import { z, defineCollection } from 'astro:content';\n\nconst docs = defineCollection({ type: 'content', schema: z.object({}) });\n\nexport const collections = { docs };\n";
    tree.exists = vi.fn().mockReturnValue(true);
    tree.read = vi.fn().mockReturnValue(existing);

    await generator(tree, { project: 'site', name: 'posts' });
    const firstResult = writeSpy.mock.calls[0]?.[1] as string;
    expect(firstResult).toContain("'posts': posts");
    expect(firstResult).toContain('docs');

    writeSpy.mockReset();
    tree.read = vi.fn().mockReturnValue(firstResult);
    await generator(tree, { project: 'site', name: 'posts' });
    expect(writeSpy.mock.calls[0]?.[1]).toBe(firstResult);
  });
});
