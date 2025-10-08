import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import type { ProjectConfiguration } from '@nx/devkit';
import * as astro from '../../utils/astro.js';

type WriteSpy = ReturnType<typeof vi.fn<[string, string], void>>;
interface TreeWithSpy extends Tree { __writeSpy: WriteSpy }

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    generateFiles: vi.fn(),
    formatFiles: vi.fn(),
  };
});

vi.mock('../../utils/astro.js', () => ({
  detectIntegrations: vi.fn(),
}));

describe('generate-content generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(devkit.readProjectConfiguration);
  const mockGenerateFiles = vi.mocked(devkit.generateFiles);
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockDetectIntegrations = vi.mocked(astro.detectIntegrations);

  beforeEach(() => {
    const writeSpy = vi.fn<[string, string], void>();
    tree = {
      root: '/workspace',
      exists: vi.fn<[string], boolean>().mockReturnValue(false) as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<[string, string?], string | null>() as unknown as Tree['read'],
    } as unknown as Tree;
    vi.clearAllMocks();
    // attach spy for later assertions on write
    (tree as unknown as TreeWithSpy).__writeSpy = writeSpy;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/test-app',
      name: 'test-app',
    } as unknown as ProjectConfiguration);

    mockDetectIntegrations.mockReturnValue([]);
  });

  it('should generate blog preset when requested', async () => {
    await generator(tree, {
      project: 'test-app',
      presets: ['blog'],
    });

    expect(mockReadProjectConfiguration).toHaveBeenCalledWith(tree, 'test-app');
    expect(mockGenerateFiles).toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();

    // Check that generateFiles was called with the blog template
    const generateCall = mockGenerateFiles.mock.calls[0];
    expect(generateCall[2]).toContain('apps/test-app/src');
  });

  it('should not generate blog if content directory already exists', async () => {
    tree.exists = vi.fn().mockImplementation((path) => {
      return String(path).includes('content');
    });

    await generator(tree, {
      project: 'test-app',
      presets: ['blog'],
    });

    expect(mockGenerateFiles).not.toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should generate MDX example when mdxExamples is true and mdx integration detected', async () => {
    mockDetectIntegrations.mockReturnValue(['mdx']);

    await generator(tree, {
      project: 'test-app',
      mdxExamples: true,
    });

    expect(mockDetectIntegrations).toHaveBeenCalledWith('apps/test-app');
    expect(tree.write).toHaveBeenCalled();

    const writeSpy = (tree as unknown as TreeWithSpy).__writeSpy;
    const writeCall = writeSpy.mock.calls[0];
    const normalizedPath = writeCall[0].replace(/\\/g, '/');
    expect(normalizedPath).toContain('apps/test-app/src/pages/example.mdx');
    expect(writeCall[1]).toBe('# Hello MDX!');
  });

  it('should not generate MDX example if mdx integration is not detected', async () => {
    mockDetectIntegrations.mockReturnValue([]);

    await generator(tree, {
      project: 'test-app',
      mdxExamples: true,
    });

    expect(tree.write).not.toHaveBeenCalled();
  });

  it('should not generate MDX example if it already exists', async () => {
    mockDetectIntegrations.mockReturnValue(['mdx']);
    tree.exists = vi.fn().mockImplementation((path) => {
      return String(path).includes('example.mdx');
    });

    await generator(tree, {
      project: 'test-app',
      mdxExamples: true,
    });

    expect(tree.write).not.toHaveBeenCalled();
  });

  it('should handle multiple presets', async () => {
    await generator(tree, {
      project: 'test-app',
      presets: ['blog', 'docs', 'landing'],
    });

    // Only blog is implemented, so only one generateFiles call
    expect(mockGenerateFiles).toHaveBeenCalledTimes(1);
  });

  it('should combine blog preset and MDX examples', async () => {
    mockDetectIntegrations.mockReturnValue(['mdx']);

    await generator(tree, {
      project: 'test-app',
      presets: ['blog'],
      mdxExamples: true,
    });

    expect(mockGenerateFiles).toHaveBeenCalled();
    expect(tree.write).toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should work with different project roots', async () => {
    mockReadProjectConfiguration.mockReturnValue({
      root: 'packages/my-docs',
      name: 'my-docs',
    } as unknown as ProjectConfiguration);

    await generator(tree, {
      project: 'my-docs',
      presets: ['blog'],
    });

    const generateCall = mockGenerateFiles.mock.calls[0];
    expect(generateCall[2]).toContain('packages/my-docs/src');
  });

  it('should detect integrations from project root', async () => {
    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/custom-app',
      name: 'custom-app',
    } as unknown as ProjectConfiguration);

    await generator(tree, {
      project: 'custom-app',
    });

    expect(mockDetectIntegrations).toHaveBeenCalledWith('apps/custom-app');
  });

  it('should not do anything if no options are provided', async () => {
    await generator(tree, {
      project: 'test-app',
    });

    expect(mockGenerateFiles).not.toHaveBeenCalled();
    expect(tree.write).not.toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should handle tailwindExamples option (currently no-op)', async () => {
    await generator(tree, {
      project: 'test-app',
      tailwindExamples: true,
    });

    // tailwindExamples is not implemented yet, so nothing should happen
    expect(mockGenerateFiles).not.toHaveBeenCalled();
    expect(tree.write).not.toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });
});
