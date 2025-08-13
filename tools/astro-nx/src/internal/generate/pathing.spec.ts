import {
  generateAstroPath,
  generateContentPath,
  generatePagePath,
  generateComponentPath,
  ensureExtension,
  createDirectoryPath,
  normalizeFileName,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  getPagesDir,
  getComponentsDir,
  getContentDir,
  ensureDirs,
} from './pathing';
import { existsSync, mkdirSync } from 'fs';

// Mock fs module
vi.mock('fs');

const mockExistsSync = vi.mocked(existsSync);
const mockMkdirSync = vi.mocked(mkdirSync);

describe('Path Generation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAstroPath', () => {
    const projectRoot = '/project';

    test('should generate page path', () => {
      const options = {
        projectRoot,
        type: 'page' as const,
        name: 'about',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/pages/about.astro');
      expect(result.relativePath).toBe('src/pages/about.astro');
      expect(result.directory).toBe('/project/src/pages');
      expect(result.filename).toBe('about.astro');
      expect(result.extension).toBe('.astro');
    });

    test('should generate component path', () => {
      const options = {
        projectRoot,
        type: 'component' as const,
        name: 'Button',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/components/Button.astro');
      expect(result.relativePath).toBe('src/components/Button.astro');
      expect(result.directory).toBe('/project/src/components');
      expect(result.filename).toBe('Button.astro');
      expect(result.extension).toBe('.astro');
    });

    test('should generate layout path', () => {
      const options = {
        projectRoot,
        type: 'layout' as const,
        name: 'BaseLayout',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/layouts/BaseLayout.astro');
      expect(result.directory).toBe('/project/src/layouts');
    });

    test('should generate content path with markdown extension', () => {
      const options = {
        projectRoot,
        type: 'content' as const,
        name: 'post',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/content/post.md');
      expect(result.extension).toBe('.md');
    });

    test('should generate astro-file path', () => {
      const options = {
        projectRoot,
        type: 'astro-file' as const,
        name: 'middleware',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/middleware.astro');
      expect(result.directory).toBe('/project/src');
    });

    test('should handle subdirectory', () => {
      const options = {
        projectRoot,
        type: 'component' as const,
        name: 'Button',
        subdir: 'ui',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/components/ui/Button.astro');
      expect(result.directory).toBe('/project/src/components/ui');
    });

    test('should handle custom extension', () => {
      const options = {
        projectRoot,
        type: 'page' as const,
        name: 'blog',
        extension: '.mdx',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/src/pages/blog.mdx');
      expect(result.extension).toBe('.mdx');
    });

    test('should handle custom srcDir', () => {
      const options = {
        projectRoot,
        srcDir: 'source',
        type: 'component' as const,
        name: 'Header',
      };

      const result = generateAstroPath(options);

      expect(result.fullPath).toBe('/project/source/components/Header.astro');
      expect(result.directory).toBe('/project/source/components');
    });

    test('should throw error for unknown path type', () => {
      const options = {
        projectRoot,
        type: 'unknown' as 'component',
        name: 'test',
      };

      expect(() => generateAstroPath(options)).toThrow('Unknown path type: unknown');
    });

    test('should ensure extension on filename', () => {
      const options = {
        projectRoot,
        type: 'page' as const,
        name: 'about.astro',
      };

      const result = generateAstroPath(options);

      expect(result.filename).toBe('about.astro');
      expect(result.fullPath).toBe('/project/src/pages/about.astro');
    });
  });

  describe('generateContentPath', () => {
    test('should generate content path for collection', () => {
      const result = generateContentPath('/project', 'blog', 'first-post');

      expect(result.fullPath).toBe('/project/src/content/blog/first-post.md');
      expect(result.directory).toBe('/project/src/content/blog');
      expect(result.filename).toBe('first-post.md');
      expect(result.extension).toBe('.md');
    });

    test('should ensure .md extension on filename', () => {
      const result = generateContentPath('/project', 'docs', 'guide.md');

      expect(result.filename).toBe('guide.md');
      expect(result.fullPath).toBe('/project/src/content/docs/guide.md');
    });
  });

  describe('generatePagePath', () => {
    test('should generate simple page path', () => {
      const result = generatePagePath('/project', 'about');

      expect(result.fullPath).toBe('/project/src/pages/about.astro');
      expect(result.directory).toBe('/project/src/pages');
      expect(result.filename).toBe('about.astro');
    });

    test('should generate nested page path', () => {
      const result = generatePagePath('/project', 'post', 'blog');

      expect(result.fullPath).toBe('/project/src/pages/blog/post.astro');
      expect(result.directory).toBe('/project/src/pages/blog');
    });

    test('should ensure .astro extension', () => {
      const result = generatePagePath('/project', 'contact.astro');

      expect(result.filename).toBe('contact.astro');
    });
  });

  describe('generateComponentPath', () => {
    test('should generate simple component path', () => {
      const result = generateComponentPath('/project', 'Button');

      expect(result.fullPath).toBe('/project/src/components/Button.astro');
      expect(result.directory).toBe('/project/src/components');
    });

    test('should generate component path with subdirectory', () => {
      const result = generateComponentPath('/project', 'Modal', 'ui');

      expect(result.fullPath).toBe('/project/src/components/ui/Modal.astro');
      expect(result.directory).toBe('/project/src/components/ui');
    });
  });

  describe('ensureExtension', () => {
    test('should add extension when missing', () => {
      const result = ensureExtension('component', '.astro');
      expect(result).toBe('component.astro');
    });

    test('should keep existing extension', () => {
      const result = ensureExtension('component.vue', '.astro');
      expect(result).toBe('component.vue');
    });

    test('should handle empty filename', () => {
      const result = ensureExtension('', '.astro');
      expect(result).toBe('.astro');
    });

    test('should handle filename with multiple dots', () => {
      const result = ensureExtension('my.component.config', '.json');
      expect(result).toBe('my.component.config');
    });
  });

  describe('createDirectoryPath', () => {
    test('should join path segments', () => {
      const result = createDirectoryPath('/project', 'src', 'components', 'ui');
      expect(result).toBe('/project/src/components/ui');
    });

    test('should handle single segment', () => {
      const result = createDirectoryPath('/project');
      expect(result).toBe('/project');
    });

    test('should handle empty segments', () => {
      const result = createDirectoryPath('/project', '', 'src');
      expect(result).toBe('/project/src');
    });
  });

  describe('normalizeFileName', () => {
    test('should replace invalid characters with hyphens', () => {
      const result = normalizeFileName('my component!@#');
      expect(result).toBe('my-component');
    });

    test('should replace multiple hyphens with single hyphen', () => {
      const result = normalizeFileName('my---component');
      expect(result).toBe('my-component');
    });

    test('should remove leading and trailing hyphens', () => {
      const result = normalizeFileName('-my-component-');
      expect(result).toBe('my-component');
    });

    test('should handle valid filenames', () => {
      const result = normalizeFileName('my-component_v2.astro');
      expect(result).toBe('my-component_v2.astro');
    });

    test('should handle numbers and valid characters', () => {
      const result = normalizeFileName('component-123_test.file');
      expect(result).toBe('component-123_test.file');
    });
  });

  describe('toPascalCase', () => {
    test('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('my-component')).toBe('MyComponent');
    });

    test('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('my_component')).toBe('MyComponent');
    });

    test('should convert space separated to PascalCase', () => {
      expect(toPascalCase('my component')).toBe('MyComponent');
    });

    test('should handle single words', () => {
      expect(toPascalCase('component')).toBe('Component');
    });

    test('should handle already PascalCase', () => {
      expect(toPascalCase('MyComponent')).toBe('MyComponent');
    });

    test('should handle mixed separators', () => {
      expect(toPascalCase('my-component_name test')).toBe('MyComponentNameTest');
    });

    test('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });

    test('should convert camelCase to PascalCase by uppercasing first letter', () => {
      expect(toPascalCase('myComponent')).toBe('MyComponent');
    });

    test('should preserve internal capitals in already PascalCase/camelCase without separators', () => {
      expect(toPascalCase('MyComplexComponent')).toBe('MyComplexComponent');
      expect(toPascalCase('myComplexComponent')).toBe('MyComplexComponent');
    });
  });

  describe('toCamelCase', () => {
    test('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('my-component')).toBe('myComponent');
    });

    test('should convert snake_case to camelCase', () => {
      expect(toCamelCase('my_component')).toBe('myComponent');
    });

    test('should handle single words', () => {
      expect(toCamelCase('component')).toBe('component');
    });

    test('should handle already camelCase', () => {
      expect(toCamelCase('myComponent')).toBe('myComponent');
    });

    test('should convert PascalCase to camelCase', () => {
      expect(toCamelCase('MyComponent')).toBe('myComponent');
    });
  });

  describe('toKebabCase', () => {
    test('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('MyComponent')).toBe('my-component');
    });

    test('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('myComponent')).toBe('my-component');
    });

    test('should convert spaces to hyphens', () => {
      expect(toKebabCase('my component')).toBe('my-component');
    });

    test('should convert underscores to hyphens', () => {
      expect(toKebabCase('my_component')).toBe('my-component');
    });

    test('should handle already kebab-case', () => {
      expect(toKebabCase('my-component')).toBe('my-component');
    });

    test('should handle complex cases', () => {
      expect(toKebabCase('MyComplexComponent123')).toBe('my-complex-component123');
    });

    test('should handle single words', () => {
      expect(toKebabCase('Component')).toBe('component');
    });

    test('should normalize multiple dashes to single dash', () => {
      expect(toKebabCase('my---component--name')).toBe('my-component-name');
    });

    test('should remove leading and trailing dashes', () => {
      expect(toKebabCase('-my-component-')).toBe('my-component');
    });
  });

  describe('getPagesDir', () => {
    test('should return pages directory path', () => {
      const result = getPagesDir('/project');
      expect(result).toBe('/project/src/pages');
    });
  });

  describe('getComponentsDir', () => {
    test('should return components directory path', () => {
      const result = getComponentsDir('/project');
      expect(result).toBe('/project/src/components');
    });
  });

  describe('getContentDir', () => {
    test('should prefer src/content when it exists', () => {
      mockExistsSync.mockImplementation((path) => 
        path === '/project/src/content'
      );

      const result = getContentDir('/project');
      
      expect(result).toBe('/project/src/content');
      expect(mockExistsSync).toHaveBeenCalledWith('/project/src/content');
    });

    test('should fallback to content when src/content does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = getContentDir('/project');
      
      expect(result).toBe('/project/content');
      expect(mockExistsSync).toHaveBeenCalledWith('/project/src/content');
    });
  });

  describe('ensureDirs', () => {
    test('should create directories that do not exist', () => {
      mockExistsSync.mockReturnValue(false);

      ensureDirs('/path/to/dir1', '/path/to/dir2');

      expect(mockMkdirSync).toHaveBeenCalledWith('/path/to/dir1', { recursive: true });
      expect(mockMkdirSync).toHaveBeenCalledWith('/path/to/dir2', { recursive: true });
    });

    test('should skip directories that already exist', () => {
      mockExistsSync.mockReturnValue(true);

      ensureDirs('/existing/dir1', '/existing/dir2');

      expect(mockMkdirSync).not.toHaveBeenCalled();
    });

    test('should handle mixed existing and non-existing directories', () => {
      mockExistsSync.mockImplementation((path) => 
        path === '/existing/dir'
      );

      ensureDirs('/existing/dir', '/new/dir');

      expect(mockMkdirSync).toHaveBeenCalledTimes(1);
      expect(mockMkdirSync).toHaveBeenCalledWith('/new/dir', { recursive: true });
    });

    test('should handle empty directory list', () => {
      ensureDirs();
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });
  });
});
