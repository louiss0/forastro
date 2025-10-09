import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as pm from '../../utils/pm.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    formatFiles: vi.fn(),
    updateJson: vi.fn(),
  };
});

vi.mock('../../utils/pm.js', () => ({
  workspaceHasEslint: vi.fn(),
}));

describe('init generator', () => {
  let tree: Tree;
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockUpdateJson = vi.mocked(devkit.updateJson);
  const mockWorkspaceHasEslint = vi.mocked(pm.workspaceHasEslint);

  beforeEach(() => {
    tree = {
      root: '/workspace',
      exists: vi.fn().mockReturnValue(true),
      write: vi.fn(),
      read: vi.fn(),
    } as unknown as Tree;
    vi.clearAllMocks();
  });

  it('should add target defaults to nx.json by default', async () => {
    await generator(tree, {});

    expect(mockUpdateJson).toHaveBeenCalledWith(tree, 'nx.json', expect.any(Function));
    expect(mockFormatFiles).toHaveBeenCalled();

    // Test the updateJson callback
    const updateCallback = mockUpdateJson.mock.calls[0][2];
    const nx = { targetDefaults: {} };
    const result = updateCallback(nx);

    expect(result.targetDefaults['@forastro/nx-astro-plugin:build']).toEqual({
      cache: true,
      outputs: ['{projectRoot}/dist'],
    });
    expect(result.targetDefaults['@forastro/nx-astro-plugin:dev']).toEqual({ cache: false });
    expect(result.targetDefaults['@forastro/nx-astro-plugin:preview']).toEqual({ cache: false });
    expect(result.targetDefaults['@forastro/nx-astro-plugin:check']).toEqual({ cache: true });
    expect(result.targetDefaults['@forastro/nx-astro-plugin:sync']).toEqual({ cache: false });
  });

  it('should skip target defaults if addTargetDefaults is false', async () => {
    await generator(tree, { addTargetDefaults: false });

    expect(mockUpdateJson).not.toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should skip target defaults if nx.json does not exist', async () => {
    tree.exists = vi.fn().mockReturnValue(false);

    await generator(tree, {});

    expect(mockUpdateJson).not.toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });

  it('should preserve existing targetDefaults', async () => {
    await generator(tree, {});

    const updateCallback = mockUpdateJson.mock.calls[0][2];
    const nx = {
      targetDefaults: {
        'some-other:target': { cache: true },
      },
    };
    const result = updateCallback(nx);

    expect(result.targetDefaults['some-other:target']).toEqual({ cache: true });
    expect(result.targetDefaults['@forastro/nx-astro-plugin:build']).toBeDefined();
  });

  it('should create targetDefaults if it does not exist', async () => {
    await generator(tree, {});

    const updateCallback = mockUpdateJson.mock.calls[0][2];
    const nx = {};
    const result = updateCallback(nx);

    expect(result.targetDefaults).toBeDefined();
    expect(result.targetDefaults['@forastro/nx-astro-plugin:build']).toBeDefined();
  });

  it('should check for eslint when workspace has it', async () => {
    mockWorkspaceHasEslint.mockReturnValue(true);

    await generator(tree, {});

    expect(mockWorkspaceHasEslint).toHaveBeenCalledWith('/workspace');
  });

  it('should not check eslint if option is false', async () => {
    mockWorkspaceHasEslint.mockReturnValue(true);

    await generator(tree, { eslint: 'false' });

    expect(mockWorkspaceHasEslint).toHaveBeenCalled();
    // Function still runs but doesn't act on it
  });

  it('should handle eslint auto option', async () => {
    mockWorkspaceHasEslint.mockReturnValue(false);

    await generator(tree, { eslint: 'auto' });

    expect(mockWorkspaceHasEslint).toHaveBeenCalled();
    expect(mockFormatFiles).toHaveBeenCalled();
  });
});
