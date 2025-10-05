import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'node:fs';
import { execa } from 'execa';
import { detectPackageManager, resolveAstroBinary } from './pm.js';

// Mock dependencies
vi.mock('node:fs');
vi.mock('execa');

describe('detectPackageManager', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect pnpm from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('pnpm-lock.yaml') && path.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should detect npm from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('package-lock.json') && path.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('npm');
  });

  it('should detect yarn from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('yarn.lock') && path.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('yarn');
  });

  it('should detect bun from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('bun.lockb') && path.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('bun');
  });

  it('should fallback to workspace lockfile if no project lockfile', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      // No project lockfile, but workspace has pnpm-lock.yaml
      return path.includes('pnpm-lock.yaml') && path.includes('/workspace') && !path.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should fallback to global PM detection if no lockfiles', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: any) => {
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as any);
      }
      return Promise.reject(new Error('not found'));
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should try npm after pnpm fails in global detection', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: any) => {
      if (cmd === 'npm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as any);
      }
      return Promise.reject(new Error('not found'));
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('npm');
  });

  it('should throw if no PM is detected globally', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockRejectedValue(new Error('not found'));

    await expect(
      detectPackageManager('/workspace/apps/project', '/workspace')
    ).rejects.toThrow('No package manager detected');
  });
});

describe('resolveAstroBinary', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve project-local binary first', async () => {
    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('project') && path.includes('node_modules');
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace');
    const normalized = bin.replace(/\\/g, '/');
    expect(normalized).toContain('/project/node_modules/.bin/astro');
  });

  it('should fallback to workspace binary if project binary missing', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    mockExistsSync.mockImplementation((path: any) => {
      const pathStr = String(path);
      // On Windows, path.join uses backslashes even if platform is mocked
      // So we need to check for both forward and backslashes
      const normalizedPath = pathStr.replace(/\\/g, '/');
      const isWorkspaceBin = normalizedPath === '/workspace/node_modules/.bin/astro';
      return isWorkspaceBin;
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace');
    // Normalize the result for comparison
    const normalizedBin = bin.replace(/\\/g, '/');
    expect(normalizedBin).toBe('/workspace/node_modules/.bin/astro');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should append .cmd on Windows', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    mockExistsSync.mockImplementation((path: any) => {
      return path.includes('project') && path.includes('node_modules') && path.endsWith('.cmd');
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace');
    expect(bin).toMatch(/astro\.cmd$/);

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should use global binary if allowGlobal is true and local not found', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: any, args: any) => {
      if (cmd === 'which' && args && args[0] === 'astro') {
        return Promise.resolve({ stdout: '/usr/local/bin/astro', stderr: '', exitCode: 0 } as any);
      }      
      // PM detection fallback
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as any);
      }
      return Promise.reject(new Error('not found'));
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace', true);
    expect(bin).toBe('/usr/local/bin/astro');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should throw if allowGlobal is false and local not found', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation(() => Promise.resolve({ stdout: 'pnpm', stderr: '', exitCode: 0 } as any));

    await expect(
      resolveAstroBinary('/workspace/apps/project', '/workspace', false)
    ).rejects.toThrow('Astro is not installed locally or in the workspace');
  });

  it('should throw helpful error message with detected PM', async () => {
    mockExistsSync.mockReturnValue(false);
    // Mock PM detection to return pnpm
    mockExeca.mockImplementation((cmd: any) => {
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as any);
      }
      return Promise.reject(new Error('not found'));
    });

    try {
      await resolveAstroBinary('/workspace/apps/project', '/workspace', false);
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).toContain('pnpm add -D astro');
    }
  });

  it('should use global astro.cmd on Windows if which fails', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: any, args: any) => {
      if (cmd === 'which') {
        return Promise.reject(new Error('which not available'));
      }
      if (cmd === 'astro' && args[0] === '--version') {
        return Promise.resolve({ stdout: '5.0.0', stderr: '', exitCode: 0 } as any);
      }
      return Promise.reject(new Error('not found'));
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace', true);
    expect(bin).toBe('astro.cmd');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });
});
