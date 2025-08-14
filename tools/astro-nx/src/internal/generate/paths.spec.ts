import { Tree, getProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  getProjectPaths,
  normalizeToPosix,
  buildPath,
  getProjectFilePath,
  getProjectRoot,
  type ProjectPaths
} from './paths';

// Mock getProjectConfiguration from @nx/devkit
vi.mock('@nx/devkit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();
  return {
    ...actual,
    getProjectConfiguration: vi.fn(),
  };
});

const mockGetProjectConfiguration = vi.mocked(getProjectConfiguration);

describe('Unified Project Path Resolution', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
  });

  describe('getProjectPaths', () => {
    test('should resolve paths for apps/ project structure', () => {
      // Mock project configuration for traditional apps/ structure
      mockGetProjectConfiguration.mockReturnValue({
        name: 'my-app',
        root: 'apps/my-app',
        sourceRoot: 'apps/my-app/src',
        projectType: 'application',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'my-app');

      expect(paths).toEqual<ProjectPaths>({
        root: 'apps/my-app',
        srcRoot: 'apps/my-app/src',
        pagesDir: 'apps/my-app/src/pages',
        componentsDir: 'apps/my-app/src/components',
        layoutsDir: 'apps/my-app/src/layouts',
        contentDir: 'apps/my-app/src/content',
        publicDir: 'apps/my-app/public',
      });

      expect(mockGetProjectConfiguration).toHaveBeenCalledWith(tree, 'my-app');
    });

    test('should resolve paths for packages/ project structure', () => {
      // Mock project configuration for packages/ structure
      mockGetProjectConfiguration.mockReturnValue({
        name: 'my-lib',
        root: 'packages/my-lib',
        sourceRoot: 'packages/my-lib/src',
        projectType: 'library',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'my-lib');

      expect(paths).toEqual<ProjectPaths>({
        root: 'packages/my-lib',
        srcRoot: 'packages/my-lib/src',
        pagesDir: 'packages/my-lib/src/pages',
        componentsDir: 'packages/my-lib/src/components',
        layoutsDir: 'packages/my-lib/src/layouts',
        contentDir: 'packages/my-lib/src/content',
        publicDir: 'packages/my-lib/public',
      });
    });

    test('should resolve paths for libs/ project structure', () => {
      // Mock project configuration for libs/ structure
      mockGetProjectConfiguration.mockReturnValue({
        name: 'shared-ui',
        root: 'libs/shared-ui',
        sourceRoot: 'libs/shared-ui/src',
        projectType: 'library',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'shared-ui');

      expect(paths).toEqual<ProjectPaths>({
        root: 'libs/shared-ui',
        srcRoot: 'libs/shared-ui/src',
        pagesDir: 'libs/shared-ui/src/pages',
        componentsDir: 'libs/shared-ui/src/components',
        layoutsDir: 'libs/shared-ui/src/layouts',
        contentDir: 'libs/shared-ui/src/content',
        publicDir: 'libs/shared-ui/public',
      });
    });

    test('should resolve paths for custom project structure', () => {
      // Mock project configuration for custom structure
      mockGetProjectConfiguration.mockReturnValue({
        name: 'custom-project',
        root: 'workspaces/custom-project',
        sourceRoot: 'workspaces/custom-project/source',
        projectType: 'application',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'custom-project');

      expect(paths).toEqual<ProjectPaths>({
        root: 'workspaces/custom-project',
        srcRoot: 'workspaces/custom-project/source',
        pagesDir: 'workspaces/custom-project/source/pages',
        componentsDir: 'workspaces/custom-project/source/components',
        layoutsDir: 'workspaces/custom-project/source/layouts',
        contentDir: 'workspaces/custom-project/source/content',
        publicDir: 'workspaces/custom-project/public',
      });
    });

    test('should default to src/ when sourceRoot is not specified', () => {
      // Mock project configuration without sourceRoot
      mockGetProjectConfiguration.mockReturnValue({
        name: 'no-source-root',
        root: 'apps/no-source-root',
        projectType: 'application',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'no-source-root');

      expect(paths).toEqual<ProjectPaths>({
        root: 'apps/no-source-root',
        srcRoot: 'apps/no-source-root/src',
        pagesDir: 'apps/no-source-root/src/pages',
        componentsDir: 'apps/no-source-root/src/components',
        layoutsDir: 'apps/no-source-root/src/layouts',
        contentDir: 'apps/no-source-root/src/content',
        publicDir: 'apps/no-source-root/public',
      });
    });

    test('should normalize Windows-style paths to POSIX', () => {
      // Mock project configuration with Windows-style paths
      mockGetProjectConfiguration.mockReturnValue({
        name: 'windows-path',
        root: 'apps\\windows-project',
        sourceRoot: 'apps\\windows-project\\src',
        projectType: 'application',
        targets: {}
      });

      const paths = getProjectPaths(tree, 'windows-path');

      // All paths should be normalized to use forward slashes
      expect(paths.root).toBe('apps/windows-project');
      expect(paths.srcRoot).toBe('apps/windows-project/src');
      expect(paths.pagesDir).toBe('apps/windows-project/src/pages');
      expect(paths.componentsDir).toBe('apps/windows-project/src/components');
      expect(paths.publicDir).toBe('apps/windows-project/public');
    });

    test('should throw error when project is not found', () => {
      // Mock getProjectConfiguration to throw an error
      mockGetProjectConfiguration.mockImplementation(() => {
        throw new Error('Cannot find configuration for "nonexistent"');
      });

      expect(() => getProjectPaths(tree, 'nonexistent')).toThrow(
        'Cannot find configuration for "nonexistent"'
      );
    });
  });

  describe('normalizeToPosix', () => {
    test('should convert Windows backslashes to forward slashes', () => {
      const windowsPath = 'apps\\my-app\\src\\pages';
      const normalized = normalizeToPosix(windowsPath);
      
      expect(normalized).toBe('apps/my-app/src/pages');
    });

    test('should leave POSIX paths unchanged', () => {
      const posixPath = 'apps/my-app/src/pages';
      const normalized = normalizeToPosix(posixPath);
      
      expect(normalized).toBe('apps/my-app/src/pages');
    });

    test('should handle mixed separators', () => {
      const mixedPath = 'apps\\my-app/src\\pages/component.astro';
      const normalized = normalizeToPosix(mixedPath);
      
      expect(normalized).toBe('apps/my-app/src/pages/component.astro');
    });

    test('should handle empty string', () => {
      const normalized = normalizeToPosix('');
      expect(normalized).toBe('');
    });

    test('should handle root paths', () => {
      expect(normalizeToPosix('C:\\Users\\name')).toBe('C:/Users/name');
      expect(normalizeToPosix('/home/user')).toBe('/home/user');
    });
  });

  describe('buildPath', () => {
    test('should join path segments with POSIX separators', () => {
      const path = buildPath('apps', 'my-app', 'src', 'pages');
      expect(path).toBe('apps/my-app/src/pages');
    });

    test('should handle single segment', () => {
      const path = buildPath('apps');
      expect(path).toBe('apps');
    });

    test('should handle empty segments', () => {
      const path = buildPath('apps', '', 'my-app', 'src');
      expect(path).toBe('apps/my-app/src');
    });

    test('should normalize mixed separators in segments', () => {
      const path = buildPath('apps\\my-app', 'src/pages', 'component.astro');
      expect(path).toBe('apps/my-app/src/pages/component.astro');
    });
  });

  describe('getProjectFilePath', () => {
    beforeEach(() => {
      // Setup mock project configuration
      mockGetProjectConfiguration.mockReturnValue({
        name: 'test-app',
        root: 'apps/test-app',
        sourceRoot: 'apps/test-app/src',
        projectType: 'application',
        targets: {}
      });
    });

    test('should get pages directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'pages');
      expect(path).toBe('apps/test-app/src/pages');
    });

    test('should get pages file path with relative path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'pages', 'blog/index.astro');
      expect(path).toBe('apps/test-app/src/pages/blog/index.astro');
    });

    test('should get components directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'components');
      expect(path).toBe('apps/test-app/src/components');
    });

    test('should get components file path with relative path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'components', 'ui/Button.astro');
      expect(path).toBe('apps/test-app/src/components/ui/Button.astro');
    });

    test('should get layouts directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'layouts');
      expect(path).toBe('apps/test-app/src/layouts');
    });

    test('should get content directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'content');
      expect(path).toBe('apps/test-app/src/content');
    });

    test('should get public directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'public');
      expect(path).toBe('apps/test-app/public');
    });

    test('should get public file path with relative path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'public', 'images/logo.png');
      expect(path).toBe('apps/test-app/public/images/logo.png');
    });

    test('should get src directory path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'src');
      expect(path).toBe('apps/test-app/src');
    });

    test('should get src file path with relative path', () => {
      const path = getProjectFilePath(tree, 'test-app', 'src', 'env.d.ts');
      expect(path).toBe('apps/test-app/src/env.d.ts');
    });

    test('should throw error for unknown directory type', () => {
      expect(() => 
        getProjectFilePath(tree, 'test-app', 'unknown' as 'pages')
      ).toThrow('Unknown directory type: unknown');
    });
  });

  describe('getProjectRoot (legacy)', () => {
    test('should return project root for backward compatibility', () => {
      mockGetProjectConfiguration.mockReturnValue({
        name: 'legacy-app',
        root: 'apps/legacy-app',
        sourceRoot: 'apps/legacy-app/src',
        projectType: 'application',
        targets: {}
      });

      const root = getProjectRoot(tree, 'legacy-app');
      expect(root).toBe('apps/legacy-app');
    });
  });

  describe('Cross-platform consistency', () => {
    test('should produce consistent paths regardless of OS path separators', () => {
      // Test with various OS-style paths
      const configs = [
        {
          name: 'unix-style',
          root: 'apps/test-app',
          sourceRoot: 'apps/test-app/src',
        },
        {
          name: 'windows-style',
          root: 'apps\\test-app',
          sourceRoot: 'apps\\test-app\\src',
        },
        {
          name: 'mixed-style',
          root: 'apps\\test-app',
          sourceRoot: 'apps/test-app/src',
        }
      ];

      configs.forEach((config, index) => {
        mockGetProjectConfiguration.mockReturnValueOnce({
          ...config,
          projectType: 'application',
          targets: {}
        });

        const paths = getProjectPaths(tree, `test-${index}`);

        // All results should be identical regardless of input separator style
        expect(paths).toEqual({
          root: 'apps/test-app',
          srcRoot: 'apps/test-app/src',
          pagesDir: 'apps/test-app/src/pages',
          componentsDir: 'apps/test-app/src/components',
          layoutsDir: 'apps/test-app/src/layouts',
          contentDir: 'apps/test-app/src/content',
          publicDir: 'apps/test-app/public',
        });
      });
    });
  });
});
