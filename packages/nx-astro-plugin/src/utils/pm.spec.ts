import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { execa } from 'execa';
import { detectPackageManager, resolveAstroBinary, getExecFor, workspaceHasEslint } from './pm.js';

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
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('pnpm-lock.yaml') && p.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should detect npm from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('package-lock.json') && p.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('npm');
  });

  it('should detect yarn from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('yarn.lock') && p.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('yarn');
  });

  it('should detect bun from project-local lockfile', async () => {
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('bun.lockb') && p.includes('project');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('bun');
  });

  it('should fallback to workspace lockfile if no project lockfile', async () => {
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      const normalized = p.replace(/\\+/g, '/');
      // No project lockfile, but workspace has pnpm-lock.yaml
      return normalized.includes('/workspace/pnpm-lock.yaml') && !normalized.includes('/apps/project/');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should detect yarn from workspace lockfile', async () => {
    const mockExistsSync = vi.mocked(existsSync);
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      const normalized = p.replace(/\\+/g, '/');
      return normalized.includes('/workspace/yarn.lock') && !normalized.includes('/apps/project/');
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('yarn');
  });

  it('should fallback to global PM detection if no lockfiles', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: string) => {
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      return Promise.reject(new Error('not found'));
    });

    const pm = await detectPackageManager('/workspace/apps/project', '/workspace');
    expect(pm).toBe('pnpm');
  });

  it('should try npm after pnpm fails in global detection', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: string) => {
      if (cmd === 'npm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
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

describe('getExecFor', () => {
  it('returns pnpm dlx for pnpm', () => {
    expect(getExecFor('pnpm')).toEqual({ npx: 'pnpm', runner: ['dlx'] });
  });
  it('returns yarn dlx for yarn', () => {
    expect(getExecFor('yarn')).toEqual({ npx: 'yarn', runner: ['dlx'] });
  });
  it('returns bunx for bun', () => {
    expect(getExecFor('bun')).toEqual({ npx: 'bunx', runner: [] });
  });
  it('returns npx for npm/default', () => {
    expect(getExecFor('npm')).toEqual({ npx: 'npx', runner: [] });
    // @ts-expect-error testing default branch
    expect(getExecFor('unknown')).toEqual({ npx: 'npx', runner: [] });
  });
});

describe('workspaceHasEslint', () => {
  const mockReadFileSync = vi.mocked(readFileSync);

  it('returns true when devDependencies.eslint exists', () => {
    mockReadFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify({ devDependencies: { eslint: '^9.0.0' } })) as any);
    expect(workspaceHasEslint('/workspace')).toBe(true);
  });

  it('returns false when package.json missing or invalid', () => {
    mockReadFileSync.mockImplementationOnce(() => { throw new Error('no file'); });
    expect(workspaceHasEslint('/workspace')).toBe(false);
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
    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('project') && p.includes('node_modules');
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace');
    const normalized = bin.replace(/\\/g, '/');
    expect(normalized).toContain('/project/node_modules/.bin/astro');
  });

  it('should fallback to workspace binary if project binary missing', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    mockExistsSync.mockImplementation((path: unknown) => {
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

    mockExistsSync.mockImplementation((path: unknown) => {
      const p = String(path);
      return p.includes('project') && p.includes('node_modules') && p.endsWith('.cmd');
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace');
    expect(bin).toMatch(/astro\.cmd$/);

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should use global binary if allowGlobal is true and local not found', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'which' && args && args[0] === 'astro') {
        return Promise.resolve({ stdout: '/usr/local/bin/astro', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      // PM detection fallback
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      return Promise.reject(new Error('not found'));
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace', true);
    expect(bin).toBe('/usr/local/bin/astro');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should throw if allowGlobal is false and local not found', async () => {
    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation(() => Promise.resolve({ stdout: 'pnpm', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>));

    await expect(
      resolveAstroBinary('/workspace/apps/project', '/workspace', false)
    ).rejects.toThrow('Astro is not installed locally or in the workspace');
  });

  it('should throw helpful error message with detected PM', async () => {
    mockExistsSync.mockReturnValue(false);
    // Mock PM detection to return pnpm
    mockExeca.mockImplementation((cmd: string) => {
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      return Promise.reject(new Error('not found'));
    });

    try {
      await resolveAstroBinary('/workspace/apps/project', '/workspace', false);
      expect.fail('Should have thrown');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toContain('pnpm add -D astro');
    }
  });

  it('should throw helpful error on Windows when global checks fail', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    const mockExistsSync = vi.mocked(existsSync);
    const mockExeca = vi.mocked(execa);

    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'where') {
        return Promise.reject(new Error('where not available'));
      }
      if (cmd === 'astro' && args && args[0] === '--version') {
        return Promise.reject(new Error('not on PATH'));
      }
      if (cmd === 'pnpm') {
        return Promise.resolve({ stdout: '10.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      return Promise.reject(new Error('not found'));
    });

    await expect(resolveAstroBinary('/workspace/apps/project', '/workspace', true)).rejects.toThrow('pnpm add -D astro');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('should use global astro.cmd on Windows if which fails', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    mockExistsSync.mockReturnValue(false);
    mockExeca.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'which') {
        return Promise.reject(new Error('which not available'));
      }
      if (cmd === 'astro' && args && args[0] === '--version') {
        return Promise.resolve({ stdout: '5.0.0', stderr: '', exitCode: 0 } as unknown as Awaited<ReturnType<typeof execa>>);
      }
      return Promise.reject(new Error('not found'));
    });

    const bin = await resolveAstroBinary('/workspace/apps/project', '/workspace', true);
    expect(bin).toBe('astro.cmd');

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });
});
