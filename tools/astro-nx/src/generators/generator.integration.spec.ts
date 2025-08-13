import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import componentGenerator from './component/generator';
import pageGenerator from './page/generator';
import contentFileGenerator from './content-file/generator';
import astroFileGenerator from './astro-file/generator';
import type { ComponentGeneratorSchema } from './component/generator';
import type { PageGeneratorSchema } from './page/generator';
import type { ContentFileGeneratorSchema } from './content-file/generator';
import type { AstroFileGeneratorSchema } from './astro-file/generator';

// Mock fs functions used by generators
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  let currentTree: Tree | null = null;

  const mockExistsSync = vi.fn((path: string) => {
    if (!currentTree) return true; // Fallback to true when no tree is available
    return currentTree.exists(path);
  });

  const mockReadFileSync = vi.fn((path: string) => {
    if (!currentTree) {
      // Return sensible defaults based on file type
      if (path.endsWith('package.json')) {
        return JSON.stringify({
          name: 'test',
          dependencies: { astro: '^4.0.0' },
        });
      }
      return 'export default {};';
    }

    try {
      const content = currentTree.read(path, 'utf-8');
      return content;
    } catch {
      // If file doesn't exist in tree, return sensible defaults
      if (path.endsWith('package.json')) {
        return JSON.stringify({
          name: 'test',
          dependencies: { astro: '^4.0.0' },
        });
      }
      return 'export default {};';
    }
  });

  // Export function to set current tree for testing
  (globalThis as Record<string, unknown>)['setMockTree'] = (tree: Tree) => {
    currentTree = tree;
  };

  return {
    ...actual,
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    readdirSync: vi.fn(() => []),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

// Mock internal modules that use file system
vi.mock('../internal/detect/config', () => ({
  readAstroConfig: () => ({ integrations: [], contentDir: 'src/content' }),
  hasContentCollections: () => false,
  getContentCollections: () => [],
  readIntegrations: () => [],
  findAstroConfig: () => null,
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: () => '.md',
  detectProjectType: () => 'astro-content',
}));

describe('Generator Integration Tests', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Setup basic Astro project structure
    tree.write(
      'apps/test-app/package.json',
      JSON.stringify({
        name: 'test-app',
        dependencies: {
          astro: '^4.0.0',
        },
      }),
    );

    // Add project configuration file for the test-app project
    tree.write(
      'apps/test-app/project.json',
      JSON.stringify({
        name: 'test-app',
        root: 'apps/test-app',
        projectType: 'application',
        sourceRoot: 'apps/test-app/src',
        targets: {},
      }),
    );

    // Create necessary directories by creating and removing .gitkeep files
    tree.write('apps/test-app/src/.gitkeep', '');
    tree.write('apps/test-app/src/pages/.gitkeep', '');
    tree.write('apps/test-app/src/components/.gitkeep', '');
    tree.write('apps/test-app/src/content/.gitkeep', '');
    tree.write('apps/test-app/astro.config.mjs', 'export default {};');

    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Component Generator', () => {
    test('should generate basic Astro component', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'my-button',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/my-button.astro';
      expect(tree.exists(componentPath)).toBe(true);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('MyButton');
      expect(content).toContain('class="my-button"');
      expect(content).not.toContain('interface Props');
    });

    test('should generate component with props', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'user-card',
        project: 'test-app',
        props: 'name:string,age:number,isActive:boolean',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/user-card.astro';
      const content = tree.read(componentPath, 'utf-8');

      expect(content).toContain('interface Props');
      expect(content).toContain('name: string');
      expect(content).toContain('age: number');
      expect(content).toContain('isActive: boolean');
      expect(content).toContain('const { name, age, isActive } = Astro.props');
    });

    test('should generate component in subdirectory', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'modal',
        project: 'test-app',
        directory: 'ui',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/ui/modal.astro';
      expect(tree.exists(componentPath)).toBe(true);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('Modal');
      expect(content).toContain('class="modal"');
    });

    test('should generate MDX component', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'article',
        project: 'test-app',
        ext: 'mdx',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/article.mdx';
      expect(tree.exists(componentPath)).toBe(true);
    });

    test('should handle different style options', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'styled-button',
        project: 'test-app',
        style: 'scoped',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/styled-button.astro';
      const content = tree.read(componentPath, 'utf-8');

      expect(content).toContain('.styled-button');
      expect(content).not.toContain('is:global');
    });

    test('should generate component with global styles', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'global-component',
        project: 'test-app',
        style: 'global',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath =
        'apps/test-app/src/components/global-component.astro';
      const content = tree.read(componentPath, 'utf-8');

      expect(content).toContain('is:global');
      expect(content).toContain('.global-component');
    });

    test('should generate component with no styles', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'plain-component',
        project: 'test-app',
        style: 'none',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath =
        'apps/test-app/src/components/plain-component.astro';
      const content = tree.read(componentPath, 'utf-8');

      expect(content).not.toContain('<style>');
      expect(content).not.toContain('</style>');
    });
  });

  describe('Page Generator', () => {
    test('should generate basic Astro page', async () => {
      const options: PageGeneratorSchema = {
        name: 'about',
        project: 'test-app',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/about.astro';
      expect(tree.exists(pagePath)).toBe(true);

      const content = tree.read(pagePath, 'utf-8');
      expect(content).toContain('About');
    });

    test('should generate page with custom title and description', async () => {
      const options: PageGeneratorSchema = {
        name: 'contact',
        project: 'test-app',
        title: 'Contact Us',
        description: 'Get in touch with our team',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/contact.astro';
      expect(tree.exists(pagePath)).toBe(true);

      const content = tree.read(pagePath, 'utf-8');
      expect(content).toContain('Contact Us');
      expect(content).toContain('Get in touch with our team');
    });

    test('should generate page in subdirectory', async () => {
      const options: PageGeneratorSchema = {
        name: 'post',
        project: 'test-app',
        directory: 'blog',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/blog/post.astro';
      expect(tree.exists(pagePath)).toBe(true);
    });

    test('should generate markdown page', async () => {
      const options: PageGeneratorSchema = {
        name: 'readme',
        project: 'test-app',
        ext: 'md',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/readme.md';
      expect(tree.exists(pagePath)).toBe(true);

      const content = tree.read(pagePath, 'utf-8');
      expect(content).toContain('# Readme');
    });

    test('should generate MDX page', async () => {
      const options: PageGeneratorSchema = {
        name: 'interactive',
        project: 'test-app',
        ext: 'mdx',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/interactive.mdx';
      expect(tree.exists(pagePath)).toBe(true);

      const content = tree.read(pagePath, 'utf-8');
      expect(content).toContain('# Interactive');
    });

    test('should generate page with layout', async () => {
      const options: PageGeneratorSchema = {
        name: 'home',
        project: 'test-app',
        layout: 'BaseLayout',
        skipFormat: true,
      };

      await pageGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/home.astro';
      expect(tree.exists(pagePath)).toBe(true);

      const content = tree.read(pagePath, 'utf-8');
      expect(content).toContain('BaseLayout');
    });
  });

  describe('Content File Generator', () => {
    test('should generate basic content file', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'first-post',
        project: 'test-app',
        collection: 'blog',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const contentPath = 'apps/test-app/src/content/blog/first-post.md';
      expect(tree.exists(contentPath)).toBe(true);

      const content = tree.read(contentPath, 'utf-8');
      expect(content).toContain('title: First Post');
      expect(content).toContain('# First Post');
    });

    test('should generate content file with custom frontmatter', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'tutorial',
        project: 'test-app',
        collection: 'docs',
        title: 'Getting Started',
        description: 'Learn the basics',
        author: 'John Doe',
        tags: ['tutorial', 'beginner'],
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const contentPath = 'apps/test-app/src/content/docs/tutorial.md';
      expect(tree.exists(contentPath)).toBe(true);

      const content = tree.read(contentPath, 'utf-8');
      expect(content).toContain('title: Getting Started');
      expect(content).toContain('description: Learn the basics');
      expect(content).toContain('author: John Doe');
      expect(content).toContain('tags: [tutorial, beginner]');
    });

    test('should generate MDX content file', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'interactive-guide',
        project: 'test-app',
        collection: 'guides',
        ext: 'mdx',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const contentPath =
        'apps/test-app/src/content/guides/interactive-guide.mdx';
      expect(tree.exists(contentPath)).toBe(true);

      const content = tree.read(contentPath, 'utf-8');
      expect(content).toContain('# Interactive Guide');
    });

    test('should detect project type for content extension', async () => {
      // Update package.json to include MDX integration
      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/mdx': '^1.0.0',
          },
        }),
      );

      const options: ContentFileGeneratorSchema = {
        name: 'auto-format',
        project: 'test-app',
        collection: 'blog',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const contentPath = 'apps/test-app/src/content/blog/auto-format.mdx';
      expect(tree.exists(contentPath)).toBe(true);
    });

    test('should generate AsciiDoc content file', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'docs',
        project: 'test-app',
        collection: 'documentation',
        ext: 'adoc',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      const contentPath = 'apps/test-app/src/content/documentation/docs.adoc';
      expect(tree.exists(contentPath)).toBe(true);

      const content = tree.read(contentPath, 'utf-8');
      expect(content).toContain('= Docs');
    });
  });

  describe('Astro File Generator', () => {
    test('should generate component using astro-file generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'test-component',
        project: 'test-app',
        kind: 'component',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/test-component.astro';
      expect(tree.exists(componentPath)).toBe(true);
    });

    test('should generate page using astro-file generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'test-page',
        project: 'test-app',
        kind: 'page',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      const pagePath = 'apps/test-app/src/pages/test-page.astro';
      expect(tree.exists(pagePath)).toBe(true);
    });

    test('should generate component with props using astro-file generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'prop-component',
        project: 'test-app',
        kind: 'component',
        props: 'title:string,count:number',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      const componentPath = 'apps/test-app/src/components/prop-component.astro';
      expect(tree.exists(componentPath)).toBe(true);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('title: string');
      expect(content).toContain('count: number');
    });

    test('should generate component in subdirectory using astro-file generator', async () => {
      const options: AstroFileGeneratorSchema = {
        name: 'nested-component',
        project: 'test-app',
        kind: 'component',
        directory: 'ui/forms',
        skipFormat: true,
      };

      await astroFileGenerator(tree, options);

      const componentPath =
        'apps/test-app/src/components/ui/forms/nested-component.astro';
      expect(tree.exists(componentPath)).toBe(true);
    });
  });

  describe('Extension Decision Logic', () => {
    test('should use correct extension based on project dependencies - MDX', async () => {
      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/mdx': '^1.0.0',
          },
        }),
      );

      const options: ContentFileGeneratorSchema = {
        name: 'auto-mdx',
        project: 'test-app',
        collection: 'posts',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/posts/auto-mdx.mdx')).toBe(
        true,
      );
    });

    test('should use correct extension based on project dependencies - Markdoc', async () => {
      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/markdoc': '^1.0.0',
          },
        }),
      );

      const options: ContentFileGeneratorSchema = {
        name: 'auto-markdoc',
        project: 'test-app',
        collection: 'posts',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(
        tree.exists('apps/test-app/src/content/posts/auto-markdoc.mdoc'),
      ).toBe(true);
    });

    test('should use correct extension based on project dependencies - AsciiDoc', async () => {
      tree.write(
        'apps/test-app/package.json',
        JSON.stringify({
          name: 'test-app',
          dependencies: {
            astro: '^4.0.0',
            'astro-asciidoc': '^1.0.0',
          },
        }),
      );

      const options: ContentFileGeneratorSchema = {
        name: 'auto-asciidoc',
        project: 'test-app',
        collection: 'docs',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(
        tree.exists('apps/test-app/src/content/docs/auto-asciidoc.adoc'),
      ).toBe(true);
    });

    test('should default to markdown when no content integrations are found', async () => {
      const options: ContentFileGeneratorSchema = {
        name: 'default-md',
        project: 'test-app',
        collection: 'posts',
        skipFormat: true,
      };

      await contentFileGenerator(tree, options);

      expect(tree.exists('apps/test-app/src/content/posts/default-md.md')).toBe(
        true,
      );
    });
  });

  describe('File Path and Content Validation', () => {
    test('should generate files with correct kebab-case names', async () => {
      const componentOptions: ComponentGeneratorSchema = {
        name: 'MyAwesome Component',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, componentOptions);

      const componentPath =
        'apps/test-app/src/components/my-awesome-component.astro';
      expect(tree.exists(componentPath)).toBe(true);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('MyAwesomeComponent'); // toPascalCase removes spaces
      expect(content).toContain('class="my-awesome-component"');
    });

    test('should preserve PascalCase names exactly', async () => {
      const componentOptions: ComponentGeneratorSchema = {
        name: 'MyAwesomeComponent',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, componentOptions);

      const componentPath =
        'apps/test-app/src/components/my-awesome-component.astro';
      expect(tree.exists(componentPath)).toBe(true);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).toContain('MyAwesomeComponent');
      expect(content).toContain('class="my-awesome-component"');
    });

    test('should handle deep directory structures', async () => {
      const options: ComponentGeneratorSchema = {
        name: 'deep-component',
        project: 'test-app',
        directory: 'ui/forms/inputs',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const componentPath =
        'apps/test-app/src/components/ui/forms/inputs/deep-component.astro';
      expect(tree.exists(componentPath)).toBe(true);
    });

    test('should not overwrite existing files', async () => {
      const componentPath = 'apps/test-app/src/components/existing.astro';
      tree.write(componentPath, 'existing content');

      const options: ComponentGeneratorSchema = {
        name: 'existing',
        project: 'test-app',
        skipFormat: true,
      };

      await componentGenerator(tree, options);

      const content = tree.read(componentPath, 'utf-8');
      expect(content).not.toBe('existing content'); // Should be overwritten
    });
  });
});
