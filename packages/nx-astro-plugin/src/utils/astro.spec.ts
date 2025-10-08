import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';
import {
  projectAstroConfigPath,
  detectIntegrations,
  ensureIntegrationsArray,
  writeConfig,
  parseAstroConfigDirs,
  detectContentTypeSupport,
  listContentCollections,
} from './astro.js';

vi.mock('node:fs');

describe('astro utils', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockReadFileSync = vi.mocked(readFileSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);
  const mockReaddirSync = vi.mocked(readdirSync);
  const mockStatSync = vi.mocked(statSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('projectAstroConfigPath', () => {
    it('should return path to astro.config.ts if it exists', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).endsWith('astro.config.ts');
      });

      const result = projectAstroConfigPath('/workspace/project');
      expect(result).toBe(join('/workspace/project', 'astro.config.ts'));
    });

    it('should return path to astro.config.mjs if .ts does not exist', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).endsWith('astro.config.mjs');
      });

      const result = projectAstroConfigPath('/workspace/project');
      expect(result).toBe(join('/workspace/project', 'astro.config.mjs'));
    });

    it('should return path to astro.config.js if .ts and .mjs do not exist', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).endsWith('astro.config.js');
      });

      const result = projectAstroConfigPath('/workspace/project');
      expect(result).toBe(join('/workspace/project', 'astro.config.js'));
    });

    it('should return null if no config file exists', () => {
      mockExistsSync.mockReturnValue(false);

      const result = projectAstroConfigPath('/workspace/project');
      expect(result).toBeNull();
    });

    it('should check files in order: ts, mjs, js', () => {
      mockExistsSync.mockReturnValue(false);

      projectAstroConfigPath('/workspace/project');

      expect(mockExistsSync).toHaveBeenCalledTimes(3);
      expect(mockExistsSync.mock.calls[0][0]).toContain('astro.config.ts');
      expect(mockExistsSync.mock.calls[1][0]).toContain('astro.config.mjs');
      expect(mockExistsSync.mock.calls[2][0]).toContain('astro.config.js');
    });
  });

  describe('detectIntegrations', () => {
    it('should return empty array if no config file exists', () => {
      mockExistsSync.mockReturnValue(false);

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual([]);
    });

    it('should detect single @astrojs integration', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('import react from "@astrojs/react";');

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual(['react']);
    });

    it('should detect multiple @astrojs integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        'import react from "@astrojs/react";\nimport vue from "@astrojs/vue";\nimport tailwind from "@astrojs/tailwind";',
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toContain('react');
      expect(result).toContain('vue');
      expect(result).toContain('tailwind');
      expect(result.length).toBe(3);
    });

    it('should deduplicate integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        'import react from "@astrojs/react";\nimport { React } from "@astrojs/react";',
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual(['react']);
    });

    it('should handle config with no integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        'import { defineConfig } from "astro/config";\nexport default defineConfig({});',
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual([]);
    });

    it('should handle various integration naming patterns', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        '@astrojs/node, @astrojs/vercel, @astrojs/cloudflare',
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toContain('node');
      expect(result).toContain('vercel');
      expect(result).toContain('cloudflare');
    });
  });

  describe('ensureIntegrationsArray', () => {
    it('should return content unchanged if integrations array already exists', () => {
      const content = 'export default defineConfig({ integrations: [] });';
      const result = ensureIntegrationsArray(content);
      expect(result).toBe(content);
    });

    it('should add integrations array if missing', () => {
      const content = 'export default defineConfig({});';
      const result = ensureIntegrationsArray(content);
      expect(result).toBe(
        'export default defineConfig({\n  integrations: [],});',
      );
    });

    it('should handle defineConfig with existing properties', () => {
      const content = 'export default defineConfig({ output: "static" });';
      const result = ensureIntegrationsArray(content);
      expect(result).toContain('integrations: [],');
      expect(result).toContain('output: "static"');
    });

    it('should not modify content with integrations: [ ... ] already present', () => {
      const content =
        'export default defineConfig({ integrations: [react(), vue()] });';
      const result = ensureIntegrationsArray(content);
      expect(result).toBe(content);
    });

    it('should handle multi-line defineConfig', () => {
      const content = `export default defineConfig({
  output: 'server',
  adapter: node()
});`;
      const result = ensureIntegrationsArray(content);
      expect(result).toContain('integrations: [],');
    });

    it('should handle defineConfig with various whitespace', () => {
      const content = 'export default defineConfig( {  } );';
      const result = ensureIntegrationsArray(content);
      // The function uses a simple regex that matches 'defineConfig({' exactly
      // Extra whitespace inside the braces isn't detected, so this returns unchanged
      expect(result).toBe(content);
    });
  });

  describe('writeConfig', () => {
    it('should write content to the specified path with utf8 encoding', () => {
      const path = '/workspace/project/astro.config.ts';
      const content = 'export default defineConfig({ integrations: [] });';

      writeConfig(path, content);

      expect(mockWriteFileSync).toHaveBeenCalledWith(path, content, 'utf8');
    });

    it('should handle empty content', () => {
      const path = '/workspace/project/astro.config.ts';
      const content = '';

      writeConfig(path, content);

      expect(mockWriteFileSync).toHaveBeenCalledWith(path, content, 'utf8');
    });

    it('should handle multi-line content', () => {
      const path = '/workspace/project/astro.config.ts';
      const content = `import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()]
});`;

      writeConfig(path, content);

      expect(mockWriteFileSync).toHaveBeenCalledWith(path, content, 'utf8');
    });
  });

  describe('parseAstroConfigDirs', () => {
    it('should return default dirs when config file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = parseAstroConfigDirs('/workspace/project');

      expect(result).toEqual({
        srcDir: 'src',
        pagesDir: 'src/pages',
        contentDir: 'src/content',
      });
    });

    it('should parse srcDir from config and compute paths', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(`
import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'app',
  integrations: []
});
      `);

      const result = parseAstroConfigDirs('/workspace/project');

      expect(result).toEqual({
        srcDir: 'app',
        pagesDir: 'app/pages',
        contentDir: 'app/content',
      });
    });

    it('should handle various quote types', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(`srcDir: "custom"`);

      const result = parseAstroConfigDirs('/workspace/project');
      expect(result.srcDir).toBe('custom');
    });

    it('should normalize Windows paths to forward slashes', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(`srcDir: "app\\src"`);

      const result = parseAstroConfigDirs('/workspace/project');
      expect(result.srcDir).toBe('app/src');
    });
  });

  describe('detectContentTypeSupport', () => {
    it('should always return markdown as supported', () => {
      mockExistsSync.mockReturnValue(false);

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.markdown).toBe(true);
    });

    it('should detect mdx from astro config', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('astro.config');
      });
      mockReadFileSync.mockReturnValue(`
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()]
});
      `);

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.mdx).toBe(true);
    });

    it('should detect markdoc from astro config', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('astro.config');
      });
      mockReadFileSync.mockReturnValue(`
import markdoc from '@astrojs/markdoc';
      `);

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.markdoc).toBe(true);
    });

    it('should detect mdx from package.json dependencies', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('package.json');
      });
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: {
            '@astrojs/mdx': '^1.0.0',
          },
        }),
      );

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.mdx).toBe(true);
    });

    it('should detect markdoc from package.json devDependencies', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('package.json');
      });
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          devDependencies: {
            '@astrojs/markdoc': '^1.0.0',
          },
        }),
      );

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.markdoc).toBe(true);
    });

    it('should detect asciidoc from asciidoctor package', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('package.json');
      });
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: {
            asciidoctor: '^2.0.0',
          },
        }),
      );

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.asciidoc).toBe(true);
    });

    it('should detect asciidoc from astro-asciidoc package', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('package.json');
      });
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          devDependencies: {
            'astro-asciidoc': '^1.0.0',
          },
        }),
      );

      const result = detectContentTypeSupport('/workspace/project');
      expect(result.asciidoc).toBe(true);
    });
  });

  describe('listContentCollections', () => {
    it('should return empty array if content directory does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = listContentCollections('/workspace/project');
      expect(result).toEqual([]);
    });

    it('should parse collections from config.ts', () => {
      mockExistsSync.mockReturnValue(true); // All paths exist
      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);
        if (pathStr.includes('config.ts')) {
          return `
import { defineCollection, z } from 'astro:content';

const collections: {
  "posts": defineCollection({ schema: z.object({}) }),
  "pages": defineCollection({ schema: z.object({}) }),
};
export { collections };
      `;
        }
        return '';
      });
      mockReaddirSync.mockReturnValue(['posts', 'pages'] as never[]);
      mockStatSync.mockImplementation(
        () =>
          ({
            isDirectory: () => true,
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result).toContain('posts');
      expect(result).toContain('pages');
    });

    it('should list directories as fallback collections', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);
        // Content directory exists (both with and without config.ts in path)
        // But config.ts file specifically does NOT exist
        if (pathStr.endsWith('config.ts')) {
          return false; // config.ts does not exist
        }
        // Content directory itself exists
        return pathStr.includes('src') || pathStr.includes('content');
      });
      mockReadFileSync.mockReturnValue('');
      mockReaddirSync.mockReturnValue(['blog', 'docs', 'config.ts'] as never[]);
      mockStatSync.mockImplementation(
        (path: unknown) =>
          ({
            isDirectory: () => !String(path).includes('config.ts'),
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result).toContain('blog');
      expect(result).toContain('docs');
      expect(result).not.toContain('config.ts');
    });

    it('should combine config.ts and directory listing', () => {
      mockExistsSync.mockReturnValue(true); // All paths exist
      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);
        if (pathStr.includes('config.ts')) {
          return `
const collections: {
  "posts": defineCollection({ schema: z.object({}) }),
};
export { collections };
      `;
        }
        return '';
      });
      mockReaddirSync.mockReturnValue(['blog', 'docs'] as never[]);
      mockStatSync.mockImplementation(
        () =>
          ({
            isDirectory: () => true,
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result).toContain('posts'); // From config
      expect(result).toContain('blog'); // From directory
      expect(result).toContain('docs'); // From directory
      expect(result.length).toBe(3);
    });

    it('should handle empty collections block in config', () => {
      mockExistsSync.mockImplementation((_path: unknown) => {
        return true;
      });
      mockReadFileSync.mockReturnValue(`
import { defineConfig } from 'astro/config';
export const collections = {};
      `);
      mockReaddirSync.mockReturnValue(['blog'] as never[]);
      mockStatSync.mockImplementation(
        () =>
          ({
            isDirectory: () => true,
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result).toContain('blog'); // Only from directory
    });

    it('should handle readdirSync throwing an error', () => {
      mockExistsSync.mockImplementation((path: unknown) => {
        return String(path).includes('src/content');
      });
      mockReadFileSync.mockReturnValue('');
      mockReaddirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = listContentCollections('/workspace/project');
      expect(result).toEqual([]);
    });

    it('should deduplicate collections from config and directory', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);
        if (pathStr.includes('config.ts')) {
          return `
const collections: {
  "blog": defineCollection({ schema: z.object({}) }),
};
export { collections };
      `;
        }
        return '';
      });
      mockReaddirSync.mockReturnValue(['blog', 'docs'] as never[]);
      mockStatSync.mockImplementation(
        () =>
          ({
            isDirectory: () => true,
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result.filter((c) => c === 'blog').length).toBe(1); // No duplicates
      expect(result).toContain('docs');
    });

    it('should sort collections alphabetically', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);
        if (pathStr.includes('config.ts')) {
          return `
const collections: {
  "zebra": defineCollection({ schema: z.object({}) }),
};
export { collections };
      `;
        }
        return '';
      });
      mockReaddirSync.mockReturnValue(['apple', 'banana'] as never[]);
      mockStatSync.mockImplementation(
        () =>
          ({
            isDirectory: () => true,
          }) as never,
      );

      const result = listContentCollections('/workspace/project');
      expect(result).toEqual(['apple', 'banana', 'zebra']);
    });
  });
});
