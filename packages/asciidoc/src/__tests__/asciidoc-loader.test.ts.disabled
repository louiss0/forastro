import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { asciidocLoader, normalizeAsciiDocAttributes, type DocumentAttributes } from '../lib/asciidoc';

// Mock all external dependencies
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('fast-glob', () => ({
  default: vi.fn().mockResolvedValue(['simple.adoc', 'nested/doc.adoc']),
}));

vi.mock('c12', () => ({
  loadConfig: vi.fn().mockResolvedValue({
    config: {
      attributes: {
        sourceHighlighter: 'shiki',
        shikiTheme: {
          light: 'github-light',
          dark: 'github-dark',
        },
      },
    },
    configFile: 'asciidoc.config.mts',
  }),
}));

vi.mock('slugify', () => ({
  default: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('asciidoctor', () => ({
  default: vi.fn().mockReturnValue({
    loadFile: vi.fn(),
    Extensions: {
      register: vi.fn(),
    },
    SyntaxHighlighter: {
      register: vi.fn(),
    },
  }),
}));

vi.mock('shiki', () => ({
  createHighlighter: vi.fn().mockResolvedValue({
    codeToHtml: vi.fn().mockReturnValue('<pre><code>highlighted code</code></pre>'),
  }),
  bundledLanguages: { javascript: {}, typescript: {} },
  bundledThemes: { 'github-dark': {}, 'github-light': {}, 'github-dark-dimmed': {} },
}));

vi.mock('prismjs', () => ({
  default: {
    highlight: vi.fn().mockReturnValue('highlighted by prism'),
    languages: { javascript: {}, typescript: {} },
  },
}));

vi.mock('prismjs/components/index.js', () => ({
  default: vi.fn(),
}));

// Import the mocked modules
import glob from 'fast-glob';
import asciidoctor from 'asciidoctor';
import { loadConfig } from 'c12';
import { createHighlighter } from 'shiki';

describe('AsciiDoc Loader Tests', () => {
  // Setup mock context with tracking for proper function calls
  const mockContext = {
    store: {
      clear: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    },
    config: {
      root: { pathname: '/project/root' },
    },
    generateDigest: vi.fn().mockReturnValue('test-digest'),
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
    collection: 'posts',
    parseData: vi.fn().mockImplementation(async (data) => data.data),
    watcher: {
      on: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeAsciiDocAttributes', () => {
    it('should convert empty strings to true', () => {
      const input: DocumentAttributes = {
        'empty-attr': '',
        'normal-attr': 'value',
      };

      const result = normalizeAsciiDocAttributes(input);

      expect(result).toEqual({
        emptyAttr: true,
        normalAttr: 'value',
      });
    });

    it('should convert CSV patterns to arrays', () => {
      const input: DocumentAttributes = {
        keywords: 'test, simple, asciidoc',
        tags: 'single,',
        'normal-text': 'not a csv',
      };

      const result = normalizeAsciiDocAttributes(input);

      expect(result).toEqual({
        keywords: ['test', 'simple', 'asciidoc'],
        tags: ['single'],
        normalText: 'not a csv',
      });
    });

    it('should convert dash-case and snake_case keys to camelCase', () => {
      const input: DocumentAttributes = {
        'user-name': 'john',
        'api_key': '12345',
        'source-highlighter': 'shiki',
        normal: 'unchanged',
      };

      const result = normalizeAsciiDocAttributes(input);

      expect(result).toEqual({
        userName: 'john',
        apiKey: '12345',
        sourceHighlighter: 'shiki',
        normal: 'unchanged',
      });
    });

    it('should handle complex attribute combinations', () => {
      const input: DocumentAttributes = {
        'empty-boolean': '',
        'csv-list': 'one, two, three',
        'mixed_case-attr': 'value',
        number: 42,
        boolean: true,
      };

      const result = normalizeAsciiDocAttributes(input);

      expect(result).toEqual({
        emptyBoolean: true,
        csvList: ['one', 'two', 'three'],
        mixedCaseAttr: 'value',
        number: 42,
        boolean: true,
      });
    });
  });

  describe('asciidocLoader', () => {
    let mockProcessor: any;
    let mockDocument: any;

    beforeEach(() => {
      // Create fresh mock objects for each test
      mockDocument = {
        getAttributes: vi.fn().mockReturnValue({
          'doc-title': 'Simple Document',
          'doc-date': '2023-12-25',
          'author': 'John Doe',
          'email': 'john@example.com',
          'description': 'A simple document for testing',
          'keywords': 'test, simple, asciidoc',
        }),
        convert: vi.fn().mockReturnValue('<div>Converted HTML</div>'),
        getImages: vi.fn().mockReturnValue([]),
        getSections: vi.fn().mockReturnValue([
          {
            getTitle: vi.fn().mockReturnValue('First Section'),
            getLevel: vi.fn().mockReturnValue(2),
          },
          {
            getTitle: vi.fn().mockReturnValue('Subsection'),
            getLevel: vi.fn().mockReturnValue(3),
          },
        ]),
      };

      mockProcessor = {
        loadFile: vi.fn().mockReturnValue(mockDocument),
        Extensions: {
          register: vi.fn(),
        },
        SyntaxHighlighter: {
          register: vi.fn(),
        },
      };

      // Update the asciidoctor mock to return our processor
      (asciidoctor as any).mockReturnValue(mockProcessor);
    });

    it('should validate content folder name format', async () => {
      // Mock specific error for invalid folder name
      const contentFolderNameError = new Error('Invalid content folder name');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a loader with an invalid folder name
      const loader = asciidocLoader('invalid folder name!');
      
      // When using a regex-based validator, it should reject this folder name
      await expect(loader.load(mockContext)).rejects.toThrow();
    });

    it('should accept valid content folder names', async () => {
      const validNames = ['content', 'src/content', 'blog/posts'];

      for (const name of validNames) {
        const loader = asciidocLoader(name);
        // Should not throw when folder names match pattern
        await expect(loader.load(mockContext)).resolves.not.toThrow();
      }
    });

    it('should process asciidoc files and store data', async () => {
      const loader = asciidocLoader('content');

      await loader.load(mockContext);

      // Verify glob was called to find .adoc files
      expect(glob).toHaveBeenCalledWith('**/*.{adoc,asciidoc}', {
        cwd: '/project/root/content/posts',
      });
      
      // Verify file loading and store operations
      expect(mockProcessor.loadFile).toHaveBeenCalled();
      expect(mockContext.store.set).toHaveBeenCalled();
      expect(mockContext.store.clear).toHaveBeenCalledBefore(mockContext.store.set);
    });

    it('should generate proper store entries with metadata', async () => {
      const loader = asciidocLoader('content');

      await loader.load(mockContext);

      // Verify store.set was called with appropriate data structure
      expect(mockContext.store.set).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          filePath: expect.any(String),
          digest: 'test-digest',
          rendered: expect.objectContaining({
            html: '<div>Converted HTML</div>',
            metadata: expect.objectContaining({
              headings: expect.arrayContaining([
                expect.objectContaining({
                  text: 'First Section',
                  depth: 2,
                  slug: 'first-section',
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('should configure asciidoc processor with shiki when specified', async () => {
      // Mock config to use shiki highlighter
      (loadConfig as any).mockResolvedValueOnce({
        config: {
          attributes: {
            sourceHighlighter: 'shiki',
            shikiTheme: {
              light: 'github-light',
              dark: 'github-dark',
            },
          },
        },
        configFile: 'asciidoc.config.mts',
      });

      const loader = asciidocLoader('content');
      await loader.load(mockContext);

      // Verify shiki highlighter registration
      expect(createHighlighter).toHaveBeenCalled();
      expect(mockProcessor.SyntaxHighlighter.register).toHaveBeenCalledWith(
        'shiki',
        expect.any(Object)
      );
    });

    it('should configure asciidoc processor with prism when specified', async () => {
      // Override mock to return prism configuration
      (loadConfig as any).mockResolvedValueOnce({
        config: {
          attributes: {
            sourceHighlighter: 'prism',
            prismLanguages: ['javascript', 'typescript'],
          },
        },
        configFile: 'asciidoc.config.mts',
      });

      const loader = asciidocLoader('content');
      await loader.load(mockContext);

      // Verify prism highlighter registration
      expect(mockProcessor.SyntaxHighlighter.register).toHaveBeenCalledWith(
        'prism',
        expect.any(Object)
      );
    });

    it('should handle missing shiki theme configuration', async () => {
      // Mock config with missing shiki theme
      (loadConfig as any).mockResolvedValueOnce({
        config: {
          attributes: {
            sourceHighlighter: 'shiki',
            // Missing shikiTheme
          },
        },
        configFile: 'asciidoc.config.mts',
      });

      const loader = asciidocLoader('content');
      await loader.load(mockContext);

      // Verify error was logged
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Shiki theme not configured')
      );
    });

    it('should handle missing prism languages configuration', async () => {
      // Mock config with missing prism languages
      (loadConfig as any).mockResolvedValueOnce({
        config: {
          attributes: {
            sourceHighlighter: 'prism',
            // Missing prismLanguages
          },
        },
        configFile: 'asciidoc.config.mts',
      });

      const loader = asciidocLoader('content');
      await loader.load(mockContext);

      // Verify error was logged
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Prism languages not configured')
      );
    });

    it('should handle files with invalid filename patterns', async () => {
      // Mock glob to return invalid filename
      (glob as any).mockResolvedValueOnce(['invalid file name!.adoc']);

      const loader = asciidocLoader('content');

      await expect(loader.load(mockContext)).rejects.toThrow(
        expect.stringContaining("This path isn't correct")
      );
    });

    it('should register blocks and macros from config', async () => {
      // Mock config with custom blocks and macros
      (loadConfig as any).mockResolvedValueOnce({
        config: {
          blocks: {
            customBlock: {
              context: 'example',
              render: vi.fn(),
            },
          },
          macros: {
            inline: {
              customMacro: {
                context: 'quoted',
                render: vi.fn(),
              },
            },
          },
        },
        configFile: 'asciidoc.config.mts',
      });

      const loader = asciidocLoader('content');
      await loader.load(mockContext);

      // Verify Extensions.register was called to register custom blocks/macros
      expect(mockProcessor.Extensions.register).toHaveBeenCalled();
    });

    it('should handle empty config gracefully', async () => {
      // Mock empty config response
      (loadConfig as any).mockResolvedValueOnce({
        config: {},
        configFile: undefined,
      });

      const loader = asciidocLoader('content');

      // Should not throw for empty config
      await expect(loader.load(mockContext)).resolves.not.toThrow();
    });

    it('should handle attribute validation errors gracefully', async () => {
      // Mock document with invalid attributes
      mockDocument.getAttributes.mockReturnValueOnce({
        'invalid-key!': 'value', // Invalid key format
      });

      const loader = asciidocLoader('content');

      // Should not throw but should log errors
      await loader.load(mockContext);
      
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('All attributes must be written in dashed or snake case')
      );
    });

    describe('file watcher events', () => {
      it('should register watcher event handlers', async () => {
        const loader = asciidocLoader('content');
        await loader.load(mockContext);

        // Verify watcher event handlers are registered
        expect(mockContext.watcher.on).toHaveBeenCalledWith('add', expect.any(Function));
        expect(mockContext.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
        expect(mockContext.watcher.on).toHaveBeenCalledWith('unlink', expect.any(Function));
      });

      it('should handle add event for asciidoc files', async () => {
        const loader = asciidocLoader('content');
        await loader.load(mockContext);

        // Get the 'add' event handler
        const addHandler = (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'add')[1];

        // Clear previous calls
        vi.clearAllMocks();

        // Simulate adding a new file
        await addHandler('/project/root/content/posts/new-file.adoc');

        // Verify file loading and store update
        expect(mockProcessor.loadFile).toHaveBeenCalledWith(
          '/project/root/content/posts/new-file.adoc',
          expect.any(Object)
        );
        expect(mockContext.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('You added this file')
        );
      });

      it('should ignore non-asciidoc files in add event', async () => {
        const loader = asciidocLoader('content');
        await loader.load(mockContext);

        const addHandler = (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'add')[1];

        // Clear previous calls
        vi.clearAllMocks();

        // Simulate adding a non-asciidoc file
        await addHandler('/project/root/content/posts/readme.md');

        // Verify no file loading occurred for non-adoc file
        expect(mockProcessor.loadFile).not.toHaveBeenCalled();
      });

      it('should handle change event for asciidoc files', async () => {
        const loader = asciidocLoader('content');
        await loader.load(mockContext);

        // Set up filename-to-slug mapping in the loader's internal map
        (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'add')[1]('/project/root/content/posts/simple.adoc');

        // Get the 'change' event handler
        const changeHandler = (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'change')[1];

        // Clear previous calls
        vi.clearAllMocks();

        // Simulate changing a file
        await changeHandler('/project/root/content/posts/simple.adoc');

        // Verify store update operations
        expect(mockContext.store.delete).toHaveBeenCalled();
        expect(mockProcessor.loadFile).toHaveBeenCalled();
        expect(mockContext.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('updated')
        );
      });

      it('should handle unlink event for asciidoc files', async () => {
        const loader = asciidocLoader('content');
        await loader.load(mockContext);

        // Set up filename-to-slug mapping in the loader's internal map
        (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'add')[1]('/project/root/content/posts/simple.adoc');

        // Get the 'unlink' event handler
        const unlinkHandler = (mockContext.watcher.on as any).mock.calls
          .find((call: any) => call[0] === 'unlink')[1];

        // Clear previous calls
        vi.clearAllMocks();

        // Simulate removing a file
        unlinkHandler('/project/root/content/posts/simple.adoc');

        // Verify store deletion
        expect(mockContext.store.delete).toHaveBeenCalled();
        expect(mockContext.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('deleted')
        );
      });
    });
  });

  describe('loader configuration edge cases', () => {
    it('should handle various source highlighter configurations', async () => {
      const configurations = [
        { sourceHighlighter: undefined },
        { sourceHighlighter: 'none' },
        { sourceHighlighter: 'shiki', shikiTheme: { light: 'github-light', dark: 'github-dark' } },
        { sourceHighlighter: 'prism', prismLanguages: ['javascript'] },
      ];

      for (const config of configurations) {
        vi.clearAllMocks();
        (loadConfig as any).mockResolvedValueOnce({
          config: { attributes: config },
          configFile: 'asciidoc.config.mts',
        });

        const loader = asciidocLoader('content');

        // Should not throw for any configuration
        await expect(loader.load(mockContext)).resolves.not.toThrow();
      }
    });
  });
});
