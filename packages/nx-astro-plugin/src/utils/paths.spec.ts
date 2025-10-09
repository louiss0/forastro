import { describe, it, expect } from 'vitest';
import { joinPathFragments } from '@nx/devkit';
import { join, normalize, sep } from 'node:path';

/**
 * Test suite for cross-platform path handling utilities.
 * 
 * This suite ensures that path operations work correctly across different
 * operating systems (Windows, Linux, macOS) by testing both forward and
 * backward slashes, absolute and relative paths, and edge cases.
 */
describe('Cross-Platform Path Handling', () => {
  describe('joinPathFragments (from @nx/devkit)', () => {
    it('should join path fragments with forward slashes', () => {
      const result = joinPathFragments('apps', 'my-site', 'src');
      expect(result).toBe('apps/my-site/src');
    });

    it('should handle absolute paths', () => {
      const result = joinPathFragments('/workspace', 'apps', 'my-site');
      expect(result).toBe('/workspace/apps/my-site');
    });

    it('should handle empty segments', () => {
      const result = joinPathFragments('apps', '', 'my-site');
      expect(result).toBe('apps/my-site');
    });

    it('should normalize double slashes', () => {
      const result = joinPathFragments('apps//my-site', 'src');
      expect(result).toBe('apps/my-site/src');
    });

    it('should handle relative paths with dots', () => {
      const result = joinPathFragments('apps', '..', 'libs');
      expect(result).toBe('libs');
    });

    it('should handle mixed path separators', () => {
      const result = joinPathFragments('apps\\my-site', 'src/components');
      // joinPathFragments normalizes to forward slashes
      expect(result).toBe('apps/my-site/src/components');
    });

    it('should handle Windows-style absolute paths', () => {
      const result = joinPathFragments('C:\\workspace', 'apps', 'my-site');
      // joinPathFragments normalizes Windows paths to Unix-style paths
      // It does NOT preserve Windows drive letters
      expect(result).toContain('workspace');
      expect(result).toContain('apps/my-site');
    });
  });

  describe('Node.js path.join', () => {
    it('should join paths with platform-specific separator', () => {
      const result = join('apps', 'my-site', 'src');
      const expected = ['apps', 'my-site', 'src'].join(sep);
      expect(result).toBe(expected);
    });

    it('should handle absolute paths', () => {
      const result = join(sep, 'workspace', 'apps', 'my-site');
      expect(result).toBe(`${sep}workspace${sep}apps${sep}my-site`);
    });

    it('should normalize relative paths', () => {
      const result = join('apps', 'my-site', '..', 'other-site');
      const expected = `apps${sep}other-site`;
      expect(result).toBe(expected);
    });

    it('should handle mixed separators on Windows', () => {
      const result = join('apps/my-site', 'src\\components');
      // join normalizes to platform separator
      expect(result).toContain('apps');
      expect(result).toContain('my-site');
      expect(result).toContain('src');
      expect(result).toContain('components');
    });

    it('should preserve Windows drive letters', () => {
      if (process.platform === 'win32') {
        const result = join('C:\\', 'workspace', 'apps');
        expect(result).toMatch(/^C:\\/);
      } else {
        // On Unix systems, this would be treated as relative path
        const result = join('C:', 'workspace', 'apps');
        expect(result).toContain('workspace');
      }
    });
  });

  describe('Node.js path.normalize', () => {
    it('should normalize forward slashes', () => {
      const result = normalize('apps/my-site/src/components');
      // On Windows, converts to backslashes; on Unix, stays as forward slashes
      expect(result).toContain('apps');
      expect(result).toContain('my-site');
    });

    it('should normalize backslashes on Windows', () => {
      const result = normalize('apps\\my-site\\src\\components');
      expect(result).toContain('apps');
      expect(result).toContain('my-site');
    });

    it('should resolve relative path segments', () => {
      const result = normalize('apps/my-site/../other-site/./src');
      expect(result).toContain('apps');
      expect(result).toContain('other-site');
      expect(result).toContain('src');
      expect(result).not.toContain('..');
      expect(result).not.toContain('./');
    });

    it('should handle multiple consecutive slashes', () => {
      const result = normalize('apps//my-site///src');
      // Should collapse to single separators
      expect(result).not.toMatch(/\/{2,}/);
      expect(result).not.toMatch(/\\{2,}/);
    });

    it('should preserve Windows UNC paths', () => {
      if (process.platform === 'win32') {
        const result = normalize('\\\\server\\share\\path\\file.txt');
        expect(result).toMatch(/^\\\\/);
      }
    });
  });

  describe('Path edge cases', () => {
    it('should handle empty strings', () => {
      // joinPathFragments with empty strings returns '.'
      expect(joinPathFragments('', '')).toBe('.');
      expect(join('', '')).toBe('.');
      expect(normalize('')).toBe('.');
    });

    it('should handle single dot', () => {
      expect(joinPathFragments('.')).toBe('.');
      expect(join('.')).toBe('.');
      expect(normalize('.')).toBe('.');
    });

    it('should handle double dots', () => {
      expect(joinPathFragments('..')).toBe('..');
      expect(join('..')).toBe('..');
      expect(normalize('..')).toBe('..');
    });

    it('should handle paths with spaces', () => {
      const result = joinPathFragments('apps', 'my site', 'src');
      expect(result).toBe('apps/my site/src');
    });

    it('should handle paths with special characters', () => {
      const result = joinPathFragments('apps', 'my-site_v2.0', 'src');
      expect(result).toBe('apps/my-site_v2.0/src');
    });

    it('should handle very long paths', () => {
      const longPath = 'a/'.repeat(100) + 'file.txt';
      const result = joinPathFragments(longPath);
      expect(result.length).toBeGreaterThan(200);
      expect(result).toContain('file.txt');
    });
  });

  describe('Real-world generator path scenarios', () => {
    it('should construct src paths correctly', () => {
      const projectRoot = 'apps/my-site';
      const sourceRoot = joinPathFragments(projectRoot, 'src');
      expect(sourceRoot).toBe('apps/my-site/src');
    });

    it('should construct component paths correctly', () => {
      const sourceRoot = 'apps/my-site/src';
      const componentPath = joinPathFragments(
        sourceRoot,
        'components',
        'Button.astro'
      );
      expect(componentPath).toBe('apps/my-site/src/components/Button.astro');
    });

    it('should construct nested content paths', () => {
      const sourceRoot = 'apps/my-site/src';
      const contentPath = joinPathFragments(
        sourceRoot,
        'content',
        'blog',
        'post-1.md'
      );
      expect(contentPath).toBe('apps/my-site/src/content/blog/post-1.md');
    });

    it('should handle paths from workspace root', () => {
      const workspaceRoot = process.platform === 'win32' 
        ? 'C:\\workspace' 
        : '/workspace';
      const projectPath = join(workspaceRoot, 'apps', 'my-site');
      
      expect(projectPath).toContain('workspace');
      expect(projectPath).toContain('apps');
      expect(projectPath).toContain('my-site');
    });

    it('should construct config file paths', () => {
      const projectRoot = 'apps/my-site';
      const configPath = joinPathFragments(projectRoot, 'astro.config.mjs');
      expect(configPath).toBe('apps/my-site/astro.config.mjs');
    });

    it('should construct schema file paths', () => {
      const sourceRoot = 'apps/my-site/src';
      const schemaPath = joinPathFragments(
        sourceRoot,
        'content',
        'config.ts'
      );
      expect(schemaPath).toBe('apps/my-site/src/content/config.ts');
    });
  });

  describe('Executor working directory scenarios', () => {
    it('should construct project cwd from context', () => {
      const workspaceRoot = process.platform === 'win32'
        ? 'C:\\workspace'
        : '/workspace';
      const projectRoot = 'apps/my-site';
      const cwd = join(workspaceRoot, projectRoot);

      if (process.platform === 'win32') {
        expect(cwd).toMatch(/^C:\\/);
      }
      expect(cwd).toContain('workspace');
      expect(cwd).toContain('apps');
      expect(cwd).toContain('my-site');
    });

    it('should handle binary resolution paths', () => {
      const projectCwd = join('apps', 'my-site');
      const binPath = join(projectCwd, 'node_modules', '.bin', 'astro');
      
      expect(binPath).toContain('apps');
      expect(binPath).toContain('my-site');
      expect(binPath).toContain('node_modules');
      expect(binPath).toContain('.bin');
    });
  });

  describe('Path comparison and normalization', () => {
    it('should compare paths after normalization', () => {
      const path1 = 'apps/my-site/src';
      const path2 = 'apps\\my-site\\src';
      
      // Normalize both before comparison
      const normalized1 = path1.replace(/\\/g, '/');
      const normalized2 = path2.replace(/\\/g, '/');
      
      expect(normalized1).toBe(normalized2);
    });

    it('should handle case sensitivity based on platform', () => {
      const path1 = 'apps/my-site';
      const path2 = 'Apps/My-Site';
      
      if (process.platform === 'win32' || process.platform === 'darwin') {
        // Windows and macOS are case-insensitive for file systems
        expect(path1.toLowerCase()).toBe(path2.toLowerCase());
      } else {
        // Linux is case-sensitive
        expect(path1).not.toBe(path2);
      }
    });
  });
});
