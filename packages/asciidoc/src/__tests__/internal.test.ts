import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies
vi.mock('c12', () => ({
  loadConfig: vi.fn()
}));

vi.mock('fast-glob', () => ({
  default: vi.fn()
}));

vi.mock('slugify', () => ({
  default: vi.fn()
}));

// Import the functions under test after mocking
import { 
  getAsciidocPaths, 
  loadAsciidocConfig, 
  generateSlug
} from '../lib/internal';
import glob from 'fast-glob';
import slugify from 'slugify';
import { loadConfig } from 'c12';

describe('Internal Utilities Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAsciidocPaths', () => {
    it('should return array of AsciiDoc file paths', async () => {
      const mockPaths = ['doc1.adoc', 'folder/doc2.asciidoc', 'nested/doc3.adoc'];
      vi.mocked(glob).mockResolvedValue(mockPaths);

      const result = await getAsciidocPaths('content');

      expect(glob).toHaveBeenCalledWith('**/*.{adoc,asciidoc}', {
        cwd: 'content'
      });
      expect(result).toEqual(mockPaths);
    });

    it('should work with different folder names', async () => {
      const mockPaths = ['posts/article.adoc'];
      vi.mocked(glob).mockResolvedValue(mockPaths);

      const result = await getAsciidocPaths('docs');

      expect(glob).toHaveBeenCalledWith('**/*.{adoc,asciidoc}', {
        cwd: 'docs'
      });
      expect(result).toEqual(mockPaths);
    });

    it('should return empty array when no files found', async () => {
      vi.mocked(glob).mockResolvedValue([]);

      const result = await getAsciidocPaths('empty-folder');

      expect(result).toEqual([]);
    });

    it('should reject empty folder name', async () => {
      await expect(getAsciidocPaths('')).rejects.toThrow();
    });

    it('should handle glob errors', async () => {
      vi.mocked(glob).mockRejectedValue(new Error('Permission denied'));

      await expect(getAsciidocPaths('restricted')).rejects.toThrow('Permission denied');
    });
  });

  describe('loadAsciidocConfig', () => {
    it('should load config with defaults when no config file exists', async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        config: {},
        configFile: 'asciidoc.config.mts'
      });

      const result = await loadAsciidocConfig('/project');

      expect(loadConfig).toHaveBeenCalledWith({
        name: 'asciidoc',
        cwd: '/project',
        omit$Keys: true
      });
      expect(result).toEqual({});
    });

    it('should handle config loading errors gracefully', async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error('Config file corrupt'));

      await expect(loadAsciidocConfig('/invalid')).rejects.toThrow('Config file corrupt');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from string', () => {
      vi.mocked(slugify).mockReturnValue('hello-world');

      const result = generateSlug('Hello World');

      expect(slugify).toHaveBeenCalledWith('Hello World', {
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g
      });
      expect(result).toBe('hello-world');
    });

    it('should handle strings with special characters', () => {
      vi.mocked(slugify).mockReturnValue('my-awesome-post');

      const result = generateSlug('My: Awesome! Post@2023');

      expect(slugify).toHaveBeenCalledWith('My: Awesome! Post@2023', {
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g
      });
      expect(result).toBe('my-awesome-post');
    });

    it('should handle empty strings', () => {
      vi.mocked(slugify).mockReturnValue('');

      const result = generateSlug('');

      expect(result).toBe('');
    });

    it('should handle strings with only special characters', () => {
      vi.mocked(slugify).mockReturnValue('');

      const result = generateSlug('!@#$%^&*()');

      expect(result).toBe('');
    });

    it('should handle unicode characters', () => {
      vi.mocked(slugify).mockReturnValue('hello-unicode');

      const result = generateSlug('Hello 世界 Ñiño');

      expect(result).toBe('hello-unicode');
    });
  });

});

// Additional tests can be added here for schema validation
// The schema is complex and would require detailed mocking of Zod structures
// For now, we focus on the utility functions that provide good coverage
