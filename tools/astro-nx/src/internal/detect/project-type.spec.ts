import { getProjectType, getDefaultContentExt, clearDetectionCache } from './project-type';
import { existsSync, readFileSync } from 'fs';

// Mock fs module
vi.mock('fs');

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

describe('Project Type Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDetectionCache(); // Clear detection cache between tests
  });

  describe('getProjectType', () => {
    const projectRoot = '/test/project';
    const packageJsonPath = '/test/project/package.json';

    test('should return markdown when package.json does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdown');
      expect(mockExistsSync).toHaveBeenCalledWith(packageJsonPath);
    });

    test('should return markdown when package.json cannot be parsed', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json content');

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdown');
    });

    test('should detect MDX project type', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/mdx': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('mdx');
    });

    test('should detect MDX project type from devDependencies', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        devDependencies: {
          '@astrojs/mdx': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('mdx');
    });

    test('should detect Markdoc project type', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/markdoc': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdoc');
    });

    test('should detect AsciiDoc project type with astro-asciidoc', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          'astro-asciidoc': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('asciidoc');
    });

    test('should detect AsciiDoc project type with @astrolib/asciidoc', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrolib/asciidoc': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('asciidoc');
    });

    test('should detect AsciiDoc project type with asciidoctor', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          'asciidoctor': '^2.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('asciidoc');
    });

    test('should prioritize MDX over other integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/mdx': '^1.0.0',
          '@astrojs/markdoc': '^1.0.0',
          'astro-asciidoc': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('mdx');
    });

    test('should prioritize Markdoc over AsciiDoc', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/markdoc': '^1.0.0',
          'astro-asciidoc': '^1.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdoc');
    });

    test('should return markdown for project without content integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          'astro': '^4.0.0',
          '@astrojs/tailwind': '^5.0.0'
        }
      }));

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdown');
    });

    test('should handle empty package.json', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({}));

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdown');
    });

    test('should handle readFile errors', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = getProjectType(projectRoot);

      expect(result).toBe('markdown');
    });
  });

  describe('getDefaultContentExt', () => {
    const projectRoot = '/test/project';

    test('should return .md for markdown project', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({}));

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.md');
    });

    test('should return .mdx for MDX project', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/mdx': '^1.0.0'
        }
      }));

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.mdx');
    });

    test('should return .mdoc for Markdoc project', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          '@astrojs/markdoc': '^1.0.0'
        }
      }));

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.mdoc');
    });

    test('should return .adoc for AsciiDoc project', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          'astro-asciidoc': '^1.0.0'
        }
      }));

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.adoc');
    });

    test('should return .md when package.json does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.md');
    });

    test('should return .md for unrecognized project types', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({
        dependencies: {
          'some-other-package': '^1.0.0'
        }
      }));

      const result = getDefaultContentExt(projectRoot);

      expect(result).toBe('.md');
    });
  });
});
