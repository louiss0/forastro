import { resolveAstroBin, resolvePackageManager } from './resolve-bin';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

// Mock fs and child_process modules
vi.mock('fs');
vi.mock('child_process');

const mockExistsSync = vi.mocked(existsSync);
const mockExecSync = vi.mocked(execSync);

describe('CLI Binary Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.platform
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    });
  });

  describe('resolveAstroBin', () => {
    const workspaceRoot = '/workspace';
    const projectRoot = '/workspace/apps/my-app';

    test('should prefer project-level astro binary on unix', () => {
      mockExistsSync.mockImplementation((path) => {
        return path === '/workspace/apps/my-app/node_modules/.bin/astro';
      });

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('/workspace/apps/my-app/node_modules/.bin/astro');
      expect(mockExistsSync).toHaveBeenCalledWith('/workspace/apps/my-app/node_modules/.bin/astro');
    });

    test('should prefer project-level astro binary on windows', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });

      mockExistsSync.mockImplementation((path) => {
        return path === '/workspace/apps/my-app/node_modules/.bin/astro.cmd';
      });

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('/workspace/apps/my-app/node_modules/.bin/astro.cmd');
      expect(mockExistsSync).toHaveBeenCalledWith('/workspace/apps/my-app/node_modules/.bin/astro.cmd');
    });

    test('should fallback to workspace-level astro binary', () => {
      mockExistsSync.mockImplementation((path) => {
        return path === '/workspace/node_modules/.bin/astro';
      });

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('/workspace/node_modules/.bin/astro');
      expect(mockExistsSync).toHaveBeenCalledWith('/workspace/apps/my-app/node_modules/.bin/astro');
      expect(mockExistsSync).toHaveBeenCalledWith('/workspace/node_modules/.bin/astro');
    });

    test('should fallback to PATH when no local binaries exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('astro');
      expect(mockExistsSync).toHaveBeenCalledTimes(2);
    });

    test('should prefer astro.cmd in PATH on Windows when available', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });
      
      mockExistsSync.mockReturnValue(false); // No local binaries
      mockExecSync.mockImplementation((command) => {
        if (command === 'where astro.cmd') {
          return Buffer.from('C:\\Program Files\\nodejs\\astro.cmd');
        }
        throw new Error('Command not found');
      });

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('astro.cmd');
      expect(mockExecSync).toHaveBeenCalledWith('where astro.cmd', { stdio: 'ignore' });
    });

    test('should fallback to astro on Windows when astro.cmd not in PATH', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });
      
      mockExistsSync.mockReturnValue(false); // No local binaries
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const result = resolveAstroBin(workspaceRoot, projectRoot);
      
      expect(result).toBe('astro');
      expect(mockExecSync).toHaveBeenCalledWith('where astro.cmd', { stdio: 'ignore' });
    });

    test('should handle different project structures', () => {
      const nestedProjectRoot = '/workspace/packages/frontend/app';
      
      mockExistsSync.mockImplementation((path) => {
        return path === '/workspace/packages/frontend/app/node_modules/.bin/astro';
      });

      const result = resolveAstroBin(workspaceRoot, nestedProjectRoot);
      
      expect(result).toBe('/workspace/packages/frontend/app/node_modules/.bin/astro');
    });
  });

  describe('resolvePackageManager', () => {
    test('should prefer JPD if available in PATH', () => {
      mockExecSync.mockImplementation((command) => {
        if (command === 'which jpd') {
          return Buffer.from('/usr/local/bin/jpd');
        }
        throw new Error('Command not found');
      });

      const result = resolvePackageManager();
      
      expect(result).toBe('jpd');
      expect(mockExecSync).toHaveBeenCalledWith('which jpd', { stdio: 'ignore' });
    });

    test('should fallback to pnpm if JPD not available', () => {
      mockExecSync.mockImplementation((command) => {
        if (command === 'which jpd') {
          throw new Error('jpd not found');
        }
        if (command === 'which pnpm') {
          return Buffer.from('/usr/local/bin/pnpm');
        }
        throw new Error('Command not found');
      });

      const result = resolvePackageManager();
      
      expect(result).toBe('pnpm');
      expect(mockExecSync).toHaveBeenCalledWith('which jpd', { stdio: 'ignore' });
      expect(mockExecSync).toHaveBeenCalledWith('which pnpm', { stdio: 'ignore' });
    });

    test('should fallback to npm if neither JPD nor pnpm available', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const result = resolvePackageManager();
      
      expect(result).toBe('npm');
      expect(mockExecSync).toHaveBeenCalledWith('which jpd', { stdio: 'ignore' });
      expect(mockExecSync).toHaveBeenCalledWith('which pnpm', { stdio: 'ignore' });
    });

    test('should handle execSync errors gracefully', () => {
      mockExecSync.mockImplementation((command) => {
        if (command === 'which jpd') {
          const error: any = new Error('ENOENT');
          error.code = 'ENOENT';
          throw error;
        }
        if (command === 'which pnpm') {
          const error: any = new Error('Command failed');
          error.code = 127;
          throw error;
        }
        throw new Error('Unexpected command');
      });

      const result = resolvePackageManager();
      
      expect(result).toBe('npm');
    });
  });
});
