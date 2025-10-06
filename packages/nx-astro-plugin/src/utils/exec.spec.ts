import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execa } from 'execa';
import { run, tryRun } from './exec.js';

vi.mock('execa');

describe('exec utils', () => {
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('run', () => {
    it('should execute command with correct arguments and cwd', async () => {
      const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
      mockExeca.mockResolvedValue(ok);

      await run('node', ['--version'], '/workspace/project');

      expect(mockExeca).toHaveBeenCalledWith(
        'node',
        ['--version'],
        { cwd: '/workspace/project', stdio: 'inherit' }
      );
    });

    it('should propagate errors from execa', async () => {
      const error = new Error('Command failed');
      mockExeca.mockRejectedValue(error);

      await expect(run('node', ['--version'], '/workspace/project')).rejects.toThrow('Command failed');
    });

    it('should handle empty args array', async () => {
      const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
      mockExeca.mockResolvedValue(ok);

      await run('pwd', [], '/workspace/project');

      expect(mockExeca).toHaveBeenCalledWith(
        'pwd',
        [],
        { cwd: '/workspace/project', stdio: 'inherit' }
      );
    });
  });

  describe('tryRun', () => {
    it('should return true on successful execution', async () => {
      const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
      mockExeca.mockResolvedValue(ok);

      const result = await tryRun('node', ['--version'], '/workspace/project');

      expect(result).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'node',
        ['--version'],
        { cwd: '/workspace/project', stdio: 'inherit' }
      );
    });

    it('should return false on failed execution', async () => {
      mockExeca.mockRejectedValue(new Error('Command failed'));

      const result = await tryRun('nonexistent-cmd', ['--version'], '/workspace/project');

      expect(result).toBe(false);
    });

    it('should not propagate errors', async () => {
      mockExeca.mockRejectedValue(new Error('Command failed'));

      // This should not throw
      const result = await tryRun('failing-cmd', [], '/workspace/project');

      expect(result).toBe(false);
    });

    it('should handle multiple sequential calls', async () => {
      const ok = {} as unknown as Awaited<ReturnType<typeof execa>>;
      mockExeca
        .mockResolvedValueOnce(ok)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(ok);

      expect(await tryRun('cmd1', [], '/workspace/project')).toBe(true);
      expect(await tryRun('cmd2', [], '/workspace/project')).toBe(false);
      expect(await tryRun('cmd3', [], '/workspace/project')).toBe(true);

      expect(mockExeca).toHaveBeenCalledTimes(3);
    });
  });
});
