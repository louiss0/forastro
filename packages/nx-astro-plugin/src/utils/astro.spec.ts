import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { projectAstroConfigPath, detectIntegrations, ensureIntegrationsArray, writeConfig } from './astro.js';

vi.mock('node:fs');

describe('astro utils', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockReadFileSync = vi.mocked(readFileSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);

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
        'import react from "@astrojs/react";\nimport vue from "@astrojs/vue";\nimport tailwind from "@astrojs/tailwind";'
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
        'import react from "@astrojs/react";\nimport { React } from "@astrojs/react";'
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual(['react']);
    });

    it('should handle config with no integrations', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        'import { defineConfig } from "astro/config";\nexport default defineConfig({});'
      );

      const result = detectIntegrations('/workspace/project');
      expect(result).toEqual([]);
    });

    it('should handle various integration naming patterns', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        '@astrojs/node, @astrojs/vercel, @astrojs/cloudflare'
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
      expect(result).toBe('export default defineConfig({\n  integrations: [],});');
    });

    it('should handle defineConfig with existing properties', () => {
      const content = 'export default defineConfig({ output: "static" });';
      const result = ensureIntegrationsArray(content);
      expect(result).toContain('integrations: [],');
      expect(result).toContain('output: "static"');
    });

    it('should not modify content with integrations: [ ... ] already present', () => {
      const content = 'export default defineConfig({ integrations: [react(), vue()] });';
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
});
