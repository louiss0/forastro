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
    if (!currentTree) return true;
    return currentTree.exists(path);
  });

  const mockReadFileSync = vi.fn((path: string) => {
    if (!currentTree) {
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
  readAstroConfig: vi.fn(() => ({ 
    integrations: [], 
    contentDir: 'src/content',
    publicDir: 'public',
    outDir: 'dist'
  })),
  hasContentCollections: vi.fn(() => false),
  getContentCollections: vi.fn(() => []),
  readIntegrations: vi.fn(() => []),
  findAstroConfig: vi.fn(() => null),
}));

vi.mock('../internal/detect/project-type', () => ({
  getDefaultContentExt: vi.fn(() => '.md'),
  detectProjectType: vi.fn(() => 'astro-content'),
  hasIntegration: vi.fn(() => false),
}));

vi.mock('../internal/discover/projects', () => ({
  discoverAstroProjects: vi.fn(() => ['test-app', 'docs-site']),
}));

vi.mock('@nx/devkit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();
  return {
    ...actual,
    getProjectConfiguration: vi.fn((tree: Tree, projectName: string) => ({
      name: projectName,
      root: `apps/${projectName}`,
      sourceRoot: `apps/${projectName}/src`,
      projectType: 'application',
      targets: {}
    })),
  };
});

describe('Full Workflow Integration Tests', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    setupMockWorkspace(tree);
    
    // Set the current tree for fs mocks
    const globalThis_ = globalThis as Record<string, unknown> & {
      setMockTree?: (tree: Tree) => void;
    };
    globalThis_.setMockTree?.(tree);
  });

  describe('Complete Astro Project Workflow', () => {
    test('should generate a complete Astro project structure with all file types', async () => {
      // Test scenario: Creating a complete blog with various file types
      
      // 1. Generate main layout component
      const layoutOptions: ComponentGeneratorSchema = {
        name: 'BaseLayout',
        project: 'blog-app',
        props: 'title:string,description?:string',
        skipFormat: true,
      };
      await componentGenerator(tree, layoutOptions);

      // 2. Generate reusable UI components
      const buttonOptions: ComponentGeneratorSchema = {
        name: 'Button',
        project: 'blog-app',
        directory: 'ui',
        props: 'variant:string,disabled?:boolean',
        style: 'scoped',
        skipFormat: true,
      };
      await componentGenerator(tree, buttonOptions);

      const cardOptions: ComponentGeneratorSchema = {
        name: 'Card',
        project: 'blog-app',
        directory: 'ui',
        props: 'title:string,content:string',
        skipFormat: true,
      };
      await componentGenerator(tree, cardOptions);

      // 3. Generate main pages
      const homeOptions: PageGeneratorSchema = {
        name: 'index',
        project: 'blog-app',
        title: 'Welcome to My Blog',
        description: 'A personal blog about web development',
        layout: 'BaseLayout',
        skipFormat: true,
      };
      await pageGenerator(tree, homeOptions);

      const aboutOptions: PageGeneratorSchema = {
        name: 'about',
        project: 'blog-app',
        title: 'About Me',
        description: 'Learn more about the author',
        layout: 'BaseLayout',
        skipFormat: true,
      };
      await pageGenerator(tree, aboutOptions);

      // 4. Generate blog post pages
      const blogIndexOptions: PageGeneratorSchema = {
        name: 'index',
        project: 'blog-app',
        directory: 'blog',
        title: 'Blog Posts',
        description: 'All my blog posts',
        layout: 'BaseLayout',
        skipFormat: true,
      };
      await pageGenerator(tree, blogIndexOptions);

      const blogPostOptions: PageGeneratorSchema = {
        name: '[slug]',
        project: 'blog-app',
        directory: 'blog',
        title: 'Blog Post',
        layout: 'BaseLayout',
        skipFormat: true,
      };
      await pageGenerator(tree, blogPostOptions);

      // 5. Generate content files
      const firstPostOptions: ContentFileGeneratorSchema = {
        name: 'first-post',
        project: 'blog-app',
        collection: 'blog',
        title: 'My First Blog Post',
        description: 'Welcome to my new blog',
        author: 'John Doe',
        tags: ['intro', 'welcome'],
        skipFormat: true,
      };
      await contentFileGenerator(tree, firstPostOptions);

      const aboutPageOptions: ContentFileGeneratorSchema = {
        name: 'about-content',
        project: 'blog-app',
        collection: 'pages',
        title: 'About This Site',
        description: 'Information about this website',
        skipFormat: true,
      };
      await contentFileGenerator(tree, aboutPageOptions);

      // 6. Generate using astro-file generator (unified)
      const contactFormOptions: AstroFileGeneratorSchema = {
        name: 'ContactForm',
        project: 'blog-app',
        kind: 'component',
        directory: 'forms',
        props: 'onSubmit:Function,disabled?:boolean',
        skipFormat: true,
      };
      await astroFileGenerator(tree, contactFormOptions);

      // Verify all files were created with correct structure
      const expectedFiles = [
        // Components
        'apps/blog-app/src/components/BaseLayout.astro',
        'apps/blog-app/src/components/ui/Button.astro',
        'apps/blog-app/src/components/ui/Card.astro',
        'apps/blog-app/src/components/forms/ContactForm.astro',
        
        // Pages
        'apps/blog-app/src/pages/index.astro',
        'apps/blog-app/src/pages/about.astro',
        'apps/blog-app/src/pages/blog/index.astro',
        'apps/blog-app/src/pages/blog/[slug].astro',
        
        // Content files
        'apps/blog-app/src/content/blog/first-post.md',
        'apps/blog-app/src/content/pages/about-content.md',
      ];

      for (const filePath of expectedFiles) {
        expect(tree.exists(filePath), `Expected ${filePath} to exist`).toBe(true);
      }

      // Verify component structure and content
      verifyComponentContent(tree, 'apps/blog-app/src/components/BaseLayout.astro', {
        name: 'BaseLayout',
        hasProps: true,
        propsInterface: ['title: string', 'description?: string'],
        hasStyle: false,
      });

      verifyComponentContent(tree, 'apps/blog-app/src/components/ui/Button.astro', {
        name: 'Button',
        hasProps: true,
        propsInterface: ['variant: string', 'disabled?: boolean'],
        hasStyle: true,
        className: 'button',
      });

      // Verify page structure and content
      verifyPageContent(tree, 'apps/blog-app/src/pages/index.astro', {
        title: 'Welcome to My Blog',
        description: 'A personal blog about web development',
        layout: 'BaseLayout',
      });

      verifyPageContent(tree, 'apps/blog-app/src/pages/blog/[slug].astro', {
        title: 'Blog Post',
        layout: 'BaseLayout',
        isDynamic: true,
      });

      // Verify content file structure
      verifyContentFile(tree, 'apps/blog-app/src/content/blog/first-post.md', {
        title: 'My First Blog Post',
        description: 'Welcome to my new blog',
        author: 'John Doe',
        tags: ['intro', 'welcome'],
        headingLevel: 1,
      });
    });

    test('should handle bulk generation across multiple projects', async () => {
      // Setup multiple projects
      setupAdditionalProject(tree, 'docs-app');
      setupAdditionalProject(tree, 'portfolio-app');

      // Use astro-file generator in bulk mode
      const bulkComponentOptions: AstroFileGeneratorSchema = {
        name: 'NavBar',
        kind: 'component',
        bulk: true,
        projects: ['blog-app', 'docs-app', 'portfolio-app'],
        props: 'links:Array<{href:string,label:string}>',
        skipFormat: true,
      };

      await astroFileGenerator(tree, bulkComponentOptions);

      // Verify component was created in all projects
      const expectedPaths = [
        'apps/blog-app/src/components/NavBar.astro',
        'apps/docs-app/src/components/NavBar.astro',
        'apps/portfolio-app/src/components/NavBar.astro',
      ];

      for (const path of expectedPaths) {
        expect(tree.exists(path), `Expected ${path} to exist`).toBe(true);
        
        const content = tree.read(path, 'utf-8');
        expect(content).toContain('NavBar');
        expect(content).toContain('interface Props');
        expect(content).toContain('links: Array<{href:string,label:string}>');
      }
    });

    test('should generate files with different extensions based on project configuration', async () => {
      // Setup project with MDX support
      tree.write(
        'apps/blog-app/package.json',
        JSON.stringify({
          name: 'blog-app',
          dependencies: {
            astro: '^4.0.0',
            '@astrojs/mdx': '^1.0.0',
          },
        })
      );

      // Mock project type detection to return MDX support
      const { detectProjectType, getDefaultContentExt } = await import('../internal/detect/project-type');
      vi.mocked(detectProjectType).mockReturnValue('astro-mdx');
      vi.mocked(getDefaultContentExt).mockReturnValue('.mdx');

      const contentOptions: ContentFileGeneratorSchema = {
        name: 'interactive-post',
        project: 'blog-app',
        collection: 'blog',
        title: 'Interactive Blog Post',
        description: 'A post with interactive components',
        skipFormat: true,
      };

      await contentFileGenerator(tree, contentOptions);

      const filePath = 'apps/blog-app/src/content/blog/interactive-post.mdx';
      expect(tree.exists(filePath)).toBe(true);

      const content = tree.read(filePath, 'utf-8');
      expect(content).toContain('# Interactive Blog Post');
      expect(content).toContain('title: Interactive Blog Post');
      expect(content).toContain('You can use JSX components');
    });

    test('should generate AsciiDoc files when project supports it', async () => {
      // Setup project with AsciiDoc support
      tree.write(
        'apps/docs-app/package.json',
        JSON.stringify({
          name: 'docs-app',
          dependencies: {
            astro: '^4.0.0',
            'astro-asciidoc': '^1.0.0',
          },
        })
      );

      // Mock project type detection
      const { detectProjectType, getDefaultContentExt } = await import('../internal/detect/project-type');
      vi.mocked(detectProjectType).mockReturnValue('astro-asciidoc');
      vi.mocked(getDefaultContentExt).mockReturnValue('.adoc');

      const docOptions: ContentFileGeneratorSchema = {
        name: 'installation-guide',
        project: 'docs-app',
        collection: 'docs',
        title: 'Installation Guide',
        description: 'How to install the software',
        skipFormat: true,
      };

      await contentFileGenerator(tree, docOptions);

      const filePath = 'apps/docs-app/src/content/docs/installation-guide.adoc';
      expect(tree.exists(filePath)).toBe(true);

      const content = tree.read(filePath, 'utf-8');
      expect(content).toContain('= Installation Guide');
      expect(content).toContain('title: Installation Guide');
      expect(content).toContain('AsciiDoc content');
    });

    test('should handle complex nested directory structures', async () => {
      const nestedComponentOptions: ComponentGeneratorSchema = {
        name: 'DataTable',
        project: 'blog-app',
        directory: 'ui/tables/advanced',
        props: 'data:Array<unknown>,columns:Array<{key:string,title:string}>',
        style: 'scoped',
        skipFormat: true,
      };

      await componentGenerator(tree, nestedComponentOptions);

      const nestedPageOptions: PageGeneratorSchema = {
        name: 'admin-dashboard',
        project: 'blog-app',
        directory: 'admin/dashboard',
        title: 'Admin Dashboard',
        description: 'Administrative dashboard',
        layout: 'AdminLayout',
        skipFormat: true,
      };

      await pageGenerator(tree, nestedPageOptions);

      const deepContentOptions: ContentFileGeneratorSchema = {
        name: 'api-reference',
        project: 'blog-app',
        collection: 'docs/api/v1',
        title: 'API Reference v1',
        description: 'Complete API documentation',
        skipFormat: true,
      };

      await contentFileGenerator(tree, deepContentOptions);

      // Verify nested structures
      expect(tree.exists('apps/blog-app/src/components/ui/tables/advanced/DataTable.astro')).toBe(true);
      expect(tree.exists('apps/blog-app/src/pages/admin/dashboard/admin-dashboard.astro')).toBe(true);
      expect(tree.exists('apps/blog-app/src/content/docs/api/v1/api-reference.md')).toBe(true);

      // Verify content structure is preserved
      const tableComponent = tree.read('apps/blog-app/src/components/ui/tables/advanced/DataTable.astro', 'utf-8');
      expect(tableComponent).toContain('DataTable');
      expect(tableComponent).toContain('data: Array<unknown>');
      expect(tableComponent).toContain('columns: Array<{key:string,title:string}>');
      expect(tableComponent).toContain('.data-table');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid file names gracefully', async () => {
      const invalidOptions: ComponentGeneratorSchema = {
        name: 'invalid-name!@#',
        project: 'blog-app',
        skipFormat: true,
      };

      await expect(componentGenerator(tree, invalidOptions)).rejects.toThrow();
    });

    test('should handle missing project gracefully', async () => {
      const missingProjectOptions: ComponentGeneratorSchema = {
        name: 'test-component',
        project: 'non-existent-project',
        skipFormat: true,
      };

      await expect(componentGenerator(tree, missingProjectOptions)).rejects.toThrow();
    });

    test('should handle conflicting options in astro-file generator', async () => {
      const conflictingOptions: AstroFileGeneratorSchema = {
        name: 'test',
        project: 'blog-app',
        kind: 'page',
        props: 'invalid:for:pages', // Props don't make sense for pages
        skipFormat: true,
      };

      // Should not throw but should warn
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await astroFileGenerator(tree, conflictingOptions);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('props parameter is ignored for pages')
      );
      
      consoleSpy.mockRestore();
    });

    test('should validate bulk mode requirements', async () => {
      const invalidBulkOptions: AstroFileGeneratorSchema = {
        name: 'test',
        kind: 'component',
        bulk: true,
        // Missing projects array
        skipFormat: true,
      };

      await expect(astroFileGenerator(tree, invalidBulkOptions)).rejects.toThrow(
        'projects array is required when bulk=true'
      );
    });
  });

  describe('Template Content Validation', () => {
    test('should generate components with correct TypeScript interfaces', async () => {
      const complexPropsOptions: ComponentGeneratorSchema = {
        name: 'ComplexComponent',
        project: 'blog-app',
        props: 'user:{id:number,name:string,email:string},settings:{theme:string,notifications:boolean}',
        skipFormat: true,
      };

      await componentGenerator(tree, complexPropsOptions);

      const content = tree.read('apps/blog-app/src/components/ComplexComponent.astro', 'utf-8');
      
      expect(content).toContain('interface Props');
      expect(content).toContain('user: {id:number,name:string,email:string}');
      expect(content).toContain('settings: {theme:string,notifications:boolean}');
      expect(content).toContain('const { user, settings } = Astro.props');
    });

    test('should generate pages with proper frontmatter and layout imports', async () => {
      const pageWithLayoutOptions: PageGeneratorSchema = {
        name: 'contact',
        project: 'blog-app',
        title: 'Contact Us',
        description: 'Get in touch with our team',
        layout: 'ContactLayout',
        skipFormat: true,
      };

      await pageGenerator(tree, pageWithLayoutOptions);

      const content = tree.read('apps/blog-app/src/pages/contact.astro', 'utf-8');
      
      expect(content).toContain("import ContactLayout from '../layouts/ContactLayout.astro'");
      expect(content).toContain('<ContactLayout');
      expect(content).toContain('title="Contact Us"');
      expect(content).toContain('description="Get in touch with our team"');
    });

    test('should generate content files with proper frontmatter structure', async () => {
      const contentWithAllFieldsOptions: ContentFileGeneratorSchema = {
        name: 'comprehensive-guide',
        project: 'blog-app',
        collection: 'tutorials',
        title: 'Comprehensive Guide to Astro',
        description: 'Everything you need to know about Astro',
        author: 'Jane Smith',
        tags: ['astro', 'tutorial', 'guide', 'comprehensive'],
        publishDate: '2023-12-01',
        draft: false,
        skipFormat: true,
      };

      await contentFileGenerator(tree, contentWithAllFieldsOptions);

      const content = tree.read('apps/blog-app/src/content/tutorials/comprehensive-guide.md', 'utf-8');
      
      expect(content).toContain('title: Comprehensive Guide to Astro');
      expect(content).toContain('description: Everything you need to know about Astro');
      expect(content).toContain('author: Jane Smith');
      expect(content).toContain('tags: [astro, tutorial, guide, comprehensive]');
      expect(content).toContain('publishDate: 2023-12-01');
      expect(content).toContain('draft: false');
      expect(content).toContain('# Comprehensive Guide to Astro');
    });
  });

  describe('File System Integration', () => {
    test('should create directory structure automatically', async () => {
      const deepStructureOptions: ComponentGeneratorSchema = {
        name: 'DeepComponent',
        project: 'blog-app',
        directory: 'deeply/nested/component/structure',
        skipFormat: true,
      };

      await componentGenerator(tree, deepStructureOptions);

      const filePath = 'apps/blog-app/src/components/deeply/nested/component/structure/DeepComponent.astro';
      expect(tree.exists(filePath)).toBe(true);

      // Verify intermediate directories were created
      expect(tree.exists('apps/blog-app/src/components/deeply')).toBe(true);
      expect(tree.exists('apps/blog-app/src/components/deeply/nested')).toBe(true);
      expect(tree.exists('apps/blog-app/src/components/deeply/nested/component')).toBe(true);
      expect(tree.exists('apps/blog-app/src/components/deeply/nested/component/structure')).toBe(true);
    });

    test('should handle file overwrites correctly', async () => {
      const componentPath = 'apps/blog-app/src/components/OverwriteTest.astro';
      
      // Create initial file
      const initialOptions: ComponentGeneratorSchema = {
        name: 'OverwriteTest',
        project: 'blog-app',
        props: 'initialProp:string',
        skipFormat: true,
      };

      await componentGenerator(tree, initialOptions);
      
      const initialContent = tree.read(componentPath, 'utf-8');
      expect(initialContent).toContain('initialProp: string');

      // Overwrite with new content
      const overwriteOptions: ComponentGeneratorSchema = {
        name: 'OverwriteTest',
        project: 'blog-app',
        props: 'newProp:number',
        skipFormat: true,
      };

      await componentGenerator(tree, overwriteOptions);
      
      const newContent = tree.read(componentPath, 'utf-8');
      expect(newContent).toContain('newProp: number');
      expect(newContent).not.toContain('initialProp: string');
    });
  });

  describe('Cross-Generator Compatibility', () => {
    test('should generate files that work together in a complete workflow', async () => {
      // Generate a layout component
      await componentGenerator(tree, {
        name: 'BlogLayout',
        project: 'blog-app',
        props: 'title:string,subtitle?:string',
        skipFormat: true,
      });

      // Generate a blog post component that uses the layout
      await componentGenerator(tree, {
        name: 'BlogPost',
        project: 'blog-app',
        props: 'post:{title:string,content:string,date:Date}',
        skipFormat: true,
      });

      // Generate a blog index page that lists posts
      await pageGenerator(tree, {
        name: 'index',
        project: 'blog-app',
        directory: 'blog',
        title: 'All Posts',
        layout: 'BlogLayout',
        skipFormat: true,
      });

      // Generate actual blog post content
      await contentFileGenerator(tree, {
        name: 'getting-started',
        project: 'blog-app',
        collection: 'posts',
        title: 'Getting Started with Our Blog',
        description: 'Welcome to our new blog platform',
        skipFormat: true,
      });

      // Verify all components exist and have correct structure
      expect(tree.exists('apps/blog-app/src/components/BlogLayout.astro')).toBe(true);
      expect(tree.exists('apps/blog-app/src/components/BlogPost.astro')).toBe(true);
      expect(tree.exists('apps/blog-app/src/pages/blog/index.astro')).toBe(true);
      expect(tree.exists('apps/blog-app/src/content/posts/getting-started.md')).toBe(true);

      // Verify they reference each other correctly
      const blogIndexPage = tree.read('apps/blog-app/src/pages/blog/index.astro', 'utf-8');
      expect(blogIndexPage).toContain('BlogLayout');
    });
  });
});

// Helper functions for setup and verification

function setupMockWorkspace(tree: Tree): void {
  // Setup basic workspace structure
  tree.write(
    'package.json',
    JSON.stringify({
      name: 'test-workspace',
      devDependencies: {
        '@nx/workspace': '^17.0.0',
      },
    })
  );

  // Setup primary test app
  setupProject(tree, 'blog-app');
}

function setupProject(tree: Tree, projectName: string): void {
  const projectRoot = `apps/${projectName}`;
  
  // Project configuration
  tree.write(
    `${projectRoot}/project.json`,
    JSON.stringify({
      name: projectName,
      root: projectRoot,
      projectType: 'application',
      sourceRoot: `${projectRoot}/src`,
      targets: {
        build: {
          executor: '@astrojs/nx:build',
        },
        dev: {
          executor: '@astrojs/nx:dev',
        },
      },
    })
  );

  // Package.json
  tree.write(
    `${projectRoot}/package.json`,
    JSON.stringify({
      name: projectName,
      dependencies: {
        astro: '^4.0.0',
      },
    })
  );

  // Astro config
  tree.write(`${projectRoot}/astro.config.mjs`, 'export default {};');

  // Create basic directory structure
  tree.write(`${projectRoot}/src/pages/.gitkeep`, '');
  tree.write(`${projectRoot}/src/components/.gitkeep`, '');
  tree.write(`${projectRoot}/src/content/.gitkeep`, '');
  tree.write(`${projectRoot}/src/layouts/.gitkeep`, '');
}

function setupAdditionalProject(tree: Tree, projectName: string): void {
  setupProject(tree, projectName);
}

interface ComponentVerifyOptions {
  name: string;
  hasProps?: boolean;
  propsInterface?: string[];
  hasStyle?: boolean;
  className?: string;
}

function verifyComponentContent(tree: Tree, filePath: string, options: ComponentVerifyOptions): void {
  const content = tree.read(filePath, 'utf-8');
  
  expect(content).toContain(options.name);
  
  if (options.hasProps && options.propsInterface) {
    expect(content).toContain('interface Props');
    for (const prop of options.propsInterface) {
      expect(content).toContain(prop);
    }
  }
  
  if (options.hasStyle && options.className) {
    expect(content).toContain('<style>');
    expect(content).toContain(`.${options.className}`);
  } else if (options.hasStyle === false) {
    expect(content).not.toContain('<style>');
  }
}

interface PageVerifyOptions {
  title: string;
  description?: string;
  layout?: string;
  isDynamic?: boolean;
}

function verifyPageContent(tree: Tree, filePath: string, options: PageVerifyOptions): void {
  const content = tree.read(filePath, 'utf-8');
  
  expect(content).toContain(`title="${options.title}"`);
  
  if (options.description) {
    expect(content).toContain(`description="${options.description}"`);
  }
  
  if (options.layout) {
    expect(content).toContain(options.layout);
  }
  
  if (options.isDynamic) {
    expect(content).toContain('Astro.params');
  }
}

interface ContentVerifyOptions {
  title: string;
  description?: string;
  author?: string;
  tags?: string[];
  headingLevel?: number;
}

function verifyContentFile(tree: Tree, filePath: string, options: ContentVerifyOptions): void {
  const content = tree.read(filePath, 'utf-8');
  
  expect(content).toContain(`title: ${options.title}`);
  
  if (options.description) {
    expect(content).toContain(`description: ${options.description}`);
  }
  
  if (options.author) {
    expect(content).toContain(`author: ${options.author}`);
  }
  
  if (options.tags) {
    expect(content).toContain(`tags: [${options.tags.join(', ')}]`);
  }
  
  const headingLevel = options.headingLevel || 1;
  const headingPrefix = '#'.repeat(headingLevel);
  expect(content).toContain(`${headingPrefix} ${options.title}`);
}
