import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as astroUtils from '../../utils/astro.js';
import * as fs from 'node:fs';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    formatFiles: vi.fn(),
  };
});

vi.mock('../../utils/astro.js', () => ({
  detectIntegrations: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('starlight-docs generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(devkit.readProjectConfiguration);
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockDetectIntegrations = vi.mocked(astroUtils.detectIntegrations);
  const mockExistsSync = vi.mocked(fs.existsSync);
  const mockReadFileSync = vi.mocked(fs.readFileSync);
  const writeSpy = vi.fn<[string, string], void>();
  const existsSpy = vi.fn<[string], boolean>();

  beforeEach(() => {
    vi.clearAllMocks();
    writeSpy.mockReset();
    existsSpy.mockReturnValue(false);

    // Default: Starlight is installed
    mockDetectIntegrations.mockReturnValue(['starlight']);
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        devDependencies: { '@astrojs/starlight': '^0.21.0' },
      }),
    );

    tree = {
      root: '/workspace',
      exists: existsSpy as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<[string, string?], string | null>() as unknown as Tree['read'],
    } as unknown as Tree;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/site',
      name: 'site',
    } as unknown as ProjectConfiguration);
  });

  describe('validation', () => {
    it('throws error when Starlight is not in astro.config', async () => {
      mockDetectIntegrations.mockReturnValue([]);

      await expect(generator(tree, { project: 'site' })).rejects.toThrow(
        'Starlight integration is not installed',
      );
    });

    it('throws error when Starlight is not in package.json', async () => {
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          devDependencies: {},
        }),
      );

      await expect(generator(tree, { project: 'site' })).rejects.toThrow(
        'Starlight integration is not installed',
      );
    });

    it('error message includes installation instructions', async () => {
      mockDetectIntegrations.mockReturnValue([]);

      await expect(generator(tree, { project: 'site' })).rejects.toThrow(
        /pnpm add -D @astrojs\/starlight/,
      );
    });

    it('error message includes add-integration generator hint', async () => {
      mockDetectIntegrations.mockReturnValue([]);

      await expect(generator(tree, { project: 'site' })).rejects.toThrow(
        /nx g @forastro\/nx-astro-plugin:add-integration/,
      );
    });
  });

  describe('basic generation', () => {
    it('creates docs index.mdx under src/content/docs', async () => {
      await generator(tree, { project: 'site' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/content/docs/index.mdx');
      expect(mockFormatFiles).toHaveBeenCalled();
    });

    it('creates index with default title and description', async () => {
      await generator(tree, { project: 'site' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('title: Documentation');
      expect(content).toContain('description: Project documentation');
    });

    it('creates index with custom title and description', async () => {
      await generator(tree, {
        project: 'site',
        title: 'My API Docs',
        description: 'Comprehensive API documentation',
      });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('title: My API Docs');
      expect(content).toContain('description: Comprehensive API documentation');
    });

    it('does not overwrite existing index.mdx', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      existsSpy.mockReturnValue(true);

      await generator(tree, { project: 'site' });

      expect(writeSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('example files generation', () => {
    it('does not create examples when includeExamples is false', async () => {
      await generator(tree, { project: 'site', includeExamples: false });

      expect(writeSpy).toHaveBeenCalledTimes(1); // Only index.mdx
    });

    it('creates all example files when includeExamples is true', async () => {
      await generator(tree, { project: 'site', includeExamples: true });

      expect(writeSpy).toHaveBeenCalledTimes(4); // index + 3 examples

      const paths = writeSpy.mock.calls.map(([path]) =>
        path.replace(/\\/g, '/'),
      );
      expect(paths).toContainEqual(
        expect.stringContaining('getting-started.mdx'),
      );
      expect(paths).toContainEqual(expect.stringContaining('guides/overview.mdx'));
      expect(paths).toContainEqual(expect.stringContaining('reference/cli.mdx'));
    });

    it('getting-started.mdx contains installation instructions', async () => {
      await generator(tree, { project: 'site', includeExamples: true });

      const gettingStartedCall = writeSpy.mock.calls.find(([path]) =>
        path.includes('getting-started'),
      );
      expect(gettingStartedCall).toBeDefined();
      expect(gettingStartedCall![1]).toContain('pnpm install');
    });

    it('guides/overview.mdx contains guides structure', async () => {
      await generator(tree, { project: 'site', includeExamples: true });

      const guidesCall = writeSpy.mock.calls.find(([path]) => {
        const normalized = path.replace(/\\/g, '/');
        return normalized.includes('guides/overview');
      });
      expect(guidesCall).toBeDefined();
      expect(guidesCall![1]).toContain('Available Guides');
    });

    it('reference/cli.mdx contains CLI commands', async () => {
      await generator(tree, { project: 'site', includeExamples: true });

      const cliCall = writeSpy.mock.calls.find(([path]) => {
        const normalized = path.replace(/\\/g, '/');
        return normalized.includes('reference/cli');
      });
      expect(cliCall).toBeDefined();
      expect(cliCall![1]).toContain('nx dev');
      expect(cliCall![1]).toContain('nx build');
    });

    it('skips existing example files', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      existsSpy.mockImplementation((path: string) =>
        path.includes('getting-started'),
      );

      await generator(tree, { project: 'site', includeExamples: true });

      expect(writeSpy).toHaveBeenCalledTimes(3); // index + 2 examples (1 skipped)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('getting-started'),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('project structure', () => {
    it('respects custom sourceRoot', async () => {
      mockReadProjectConfiguration.mockReturnValue({
        root: 'apps/site',
        name: 'site',
        sourceRoot: 'apps/site/custom-src',
      } as unknown as ProjectConfiguration);

      await generator(tree, { project: 'site' });

      const path = writeSpy.mock.calls[0][0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/custom-src/content/docs/index.mdx');
    });

    it('uses default src when sourceRoot is not defined', async () => {
      mockReadProjectConfiguration.mockReturnValue({
        root: 'apps/site',
        name: 'site',
      } as unknown as ProjectConfiguration);

      await generator(tree, { project: 'site' });

      const path = writeSpy.mock.calls[0][0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/content/docs/index.mdx');
    });
  });

  describe('formatFiles', () => {
    it('calls formatFiles after generation', async () => {
      await generator(tree, { project: 'site' });

      expect(mockFormatFiles).toHaveBeenCalledWith(tree);
    });

    it('calls formatFiles even when files are skipped', async () => {
      existsSpy.mockReturnValue(true);

      await generator(tree, { project: 'site' });

      expect(mockFormatFiles).toHaveBeenCalledWith(tree);
    });
  });
});
