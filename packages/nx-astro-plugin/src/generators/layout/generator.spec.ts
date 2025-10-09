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

describe('layout generator', () => {
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

  it('creates a layout in src/layouts with PascalCase name', async () => {
    await generator(tree, { project: 'site', name: 'Base Layout' });

    const call = writeSpy.mock.calls[0];
    const path = call[0].replace(/\\/g, '/');
    expect(path).toContain('apps/site/src/layouts/BaseLayout.astro');
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('supports directory option under src/layouts', async () => {
    await generator(tree, { project: 'site', name: 'Docs', directory: 'shared' });

    const call = writeSpy.mock.calls[0];
    const path = call[0].replace(/\\/g, '/');
    expect(path).toContain('apps/site/src/layouts/shared/Docs.astro');
  });

  describe('layout types', () => {
    it('generates base layout with SEO meta tags', async () => {
      await generator(tree, { project: 'site', name: 'Base', type: 'base' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title?: string');
      expect(content).toContain('description?: string');
      expect(content).toContain('<meta name="description"');
      expect(content).toContain('og:title');
      expect(content).toContain('twitter:card');
    });

    it('generates blog layout with article metadata', async () => {
      await generator(tree, { project: 'site', name: 'Article', type: 'blog' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('entry: CollectionEntry');
      expect(content).toContain('const { entry } = Astro.props');
      expect(content).toContain('const { title, description, pubDate, author, heroImage }');
      expect(content).toContain('og:type" content="article');
      expect(content).toContain('article:author');
      expect(content).toContain('article:published_time');
    });

    it('generates docs layout with navigation structure', async () => {
      await generator(tree, { project: 'site', name: 'Documentation', type: 'docs' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title: string');
      expect(content).toContain('section?: string');
      expect(content).toContain('<slot name="sidebar"');
      expect(content).toContain('<slot name="toc"');
      expect(content).toContain('<nav');
    });

    it('generates marketing layout with hero and sections', async () => {
      await generator(tree, { project: 'site', name: 'Landing', type: 'marketing' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title: string');
      expect(content).toContain('noIndex?: boolean');
      expect(content).toContain('<slot name="header"');
      expect(content).toContain('<slot name="hero-cta"');
      expect(content).toContain('<slot name="footer"');
      expect(content).toContain('{noIndex && <meta name="robots"');
    });

    it('defaults to base layout when type is not specified', async () => {
      await generator(tree, { project: 'site', name: 'Default' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title?: string');
      expect(content).toContain('description?: string');
      expect(content).toContain('<meta name="description"');
    });
  });

  describe('TypeScript Props interface', () => {
    it('includes proper TypeScript interface for each layout type', async () => {
      const types = ['base', 'blog', 'docs', 'marketing'] as const;

      for (const type of types) {
        writeSpy.mockReset();
        await generator(tree, { project: 'site', name: `Test${type}`, type });

        const content = writeSpy.mock.calls[0][1];
        expect(content).toContain('interface Props {');
        expect(content).toContain('const {');
        expect(content).toContain('= Astro.props');
      }
    });
  });

  describe('HTML structure', () => {
    it('generates valid HTML structure for all layout types', async () => {
      const types = ['base', 'blog', 'docs', 'marketing'] as const;

      for (const type of types) {
        writeSpy.mockReset();
        await generator(tree, { project: 'site', name: `Test${type}`, type });

        const content = writeSpy.mock.calls[0][1];
        expect(content).toContain('<!doctype html>');
        expect(content).toContain('<html lang="en">');
        expect(content).toContain('<head>');
        expect(content).toContain('<meta charset="UTF-8"');
        expect(content).toContain('<meta name="viewport"');
        expect(content).toContain('<body>');
        expect(content).toContain('<slot />');
        expect(content).toContain('</body>');
        expect(content).toContain('</html>');
      }
    });
  });
});
