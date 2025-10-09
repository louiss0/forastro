import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as astroUtils from '../../utils/astro.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    formatFiles: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    names: actual.names,
  };
});

vi.mock('../../utils/astro.js', () => ({
  parseAstroConfigDirs: vi.fn(),
  listContentCollections: vi.fn(),
  detectContentTypeSupport: vi.fn(),
}));

describe('content generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(
    devkit.readProjectConfiguration,
  );
  const _mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockParseAstroConfigDirs = vi.mocked(astroUtils.parseAstroConfigDirs);
  const mockListContentCollections = vi.mocked(
    astroUtils.listContentCollections,
  );
  const mockDetectContentTypeSupport = vi.mocked(
    astroUtils.detectContentTypeSupport,
  );

  const writeSpy = vi.fn<[string, string], void>();

  beforeEach(() => {
    vi.clearAllMocks();
    writeSpy.mockReset();

    tree = {
      root: '/workspace',
      exists: vi
        .fn<[string], boolean>()
        .mockReturnValue(false) as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<
        [string, string?],
        string | null
      >() as unknown as Tree['read'],
    } as unknown as Tree;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/blog',
      name: 'blog',
    } as unknown as ProjectConfiguration);

    mockParseAstroConfigDirs.mockReturnValue({
      srcDir: 'src',
      pagesDir: 'src/pages',
      contentDir: 'src/content',
    });

    mockListContentCollections.mockReturnValue(['posts', 'pages']);

    mockDetectContentTypeSupport.mockReturnValue({
      markdown: true,
      mdx: true,
      markdoc: true,
      asciidoc: true,
    });
  });

  describe('collection validation', () => {
    it('throws error when collection does not exist', async () => {
      mockListContentCollections.mockReturnValue(['posts', 'pages']);

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'invalid',
          contentType: 'markdown',
          name: 'My Post',
        }),
      ).rejects.toThrow("Collection 'invalid' not found");
    });

    it('lists available collections in error message', async () => {
      mockListContentCollections.mockReturnValue(['posts', 'pages']);

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'invalid',
          contentType: 'markdown',
          name: 'My Post',
        }),
      ).rejects.toThrow('Available collections: posts, pages');
    });

    it('proceeds when collection exists', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'My Post',
      });

      expect(writeSpy).toHaveBeenCalled();
    });
  });

  describe('content type validation', () => {
    it('throws error when mdx is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: false,
        markdoc: true,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'mdx',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'mdx' is not supported");
    });

    it('provides installation instructions in error', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: false,
        markdoc: true,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'mdx',
          name: 'My Post',
        }),
      ).rejects.toThrow('npm install @astrojs/mdx');
    });

    it('throws error when markdoc is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: true,
        markdoc: false,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'markdoc',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'markdoc' is not supported");
    });

    it('throws error when asciidoc is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: true,
        markdoc: true,
        asciidoc: false,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'asciidoc',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'asciidoc' is not supported");
    });
  });

  describe('file generation', () => {
    it('creates markdown file with YAML frontmatter', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'My First Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];

      expect(path).toContain('apps/blog/src/content/posts/my-first-post.md');
      expect(content).toContain('---');
      expect(content).toContain('title: "My First Post"');
      expect(content).toContain('description: ""');
      expect(content).toContain('draft: true');
      expect(content).toContain('tags: []');
    });

    it('creates mdx file with YAML frontmatter', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'mdx',
        name: 'Interactive Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];

      expect(path).toContain('interactive-post.mdx');
      expect(content).toContain('---');
      expect(content).toContain('title: "Interactive Post"');
    });

    it('creates markdoc file with .md extension', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdoc',
        name: 'Markdoc Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');

      expect(path).toContain('markdoc-post.md');
    });

    it('creates asciidoc file with AsciiDoc header', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'asciidoc',
        name: 'AsciiDoc Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];

      expect(path).toContain('ascii-doc-post.adoc');
      expect(content).toContain('= Ascii Doc Post');
      expect(content).toContain(':description:');
      expect(content).toContain(':draft: true');
      expect(content).toContain('== Introduction');
    });

    it('slugifies file names', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'Hello World Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');

      expect(path).toContain('hello-world-post.md');
    });
  });
});
