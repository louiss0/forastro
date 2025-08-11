import { ExecutorContext } from '@nx/devkit';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import devExecutor from './dev/executor';
import buildExecutor from './build/executor';
import previewExecutor from './preview/executor';
import checkExecutor from './check/executor';
import type { DevExecutorSchema } from './dev/executor';
import type { BuildExecutorSchema } from './build/executor';
import type { PreviewExecutorSchema } from './preview/executor';
import type { CheckExecutorSchema } from './check/executor';

// Mock child_process
vi.mock('child_process');

const mockSpawn = vi.mocked(spawn);

// Mock fs for binary resolution
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(() => true),
  };
});

describe('Executor Smoke Tests', () => {
  let mockChildProcess: EventEmitter & { kill: vi.Mock };
  let mockContext: ExecutorContext;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock child process
    mockChildProcess = new EventEmitter() as any;
    mockChildProcess.kill = vi.fn();
    
    mockSpawn.mockReturnValue(mockChildProcess as any);

    // Mock executor context
    mockContext = {
      root: '/workspace',
      projectName: 'test-app',
      projectsConfigurations: {
        version: 2,
        projects: {
          'test-app': {
            root: 'apps/test-app',
            projectType: 'application',
            sourceRoot: 'apps/test-app/src',
            targets: {}
          }
        }
      },
      cwd: '/workspace',
      isVerbose: false,
    };
  });

  afterEach(() => {
    // Clean up any lingering event listeners
    mockChildProcess.removeAllListeners();
  });

  describe('Dev Executor', () => {
    test('should spawn astro dev with default options', async () => {
      const options: DevExecutorSchema = {};
      
      // Start the executor (don't await to avoid hanging)
      const resultPromise = devExecutor(options, mockContext);
      
      // Simulate successful process completion
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['dev'],
        expect.objectContaining({
          cwd: '/workspace/apps/test-app',
          stdio: 'inherit',
          shell: process.platform === 'win32'
        })
      );
    });

    test('should spawn astro dev with custom port and host', async () => {
      const options: DevExecutorSchema = {
        port: 4321,
        host: '0.0.0.0',
        open: true,
        verbose: true,
      };
      
      const resultPromise = devExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['dev', '--port', '4321', '--host', '0.0.0.0', '--open', '--verbose'],
        expect.objectContaining({
          cwd: '/workspace/apps/test-app',
        })
      );
    });

    test('should spawn astro dev with custom config', async () => {
      const options: DevExecutorSchema = {
        config: 'custom.config.mjs',
      };
      
      const resultPromise = devExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['dev', '--config', 'custom.config.mjs'],
        expect.any(Object)
      );
    });

    test('should handle process error', async () => {
      const options: DevExecutorSchema = {};
      
      const resultPromise = devExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('error', new Error('Command failed'));
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(false);
    });

    test('should handle process exit with non-zero code', async () => {
      const options: DevExecutorSchema = {};
      
      const resultPromise = devExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 1);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(false);
    });

    test('should handle graceful shutdown on SIGINT', async () => {
      const options: DevExecutorSchema = {};
      
      const resultPromise = devExecutor(options, mockContext);
      
      // Simulate SIGINT
      setTimeout(() => {
        process.emit('SIGINT', 'SIGINT');
        // Then simulate process closing
        setTimeout(() => {
          mockChildProcess.emit('close', 0);
        }, 5);
      }, 10);

      const result = await resultPromise;

      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGINT');
      expect(result.success).toBe(true);
    });
  });

  describe('Build Executor', () => {
    test('should spawn astro build with default options', async () => {
      const options: BuildExecutorSchema = {};
      
      const resultPromise = buildExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['build'],
        expect.objectContaining({
          cwd: '/workspace/apps/test-app',
          stdio: 'inherit',
        })
      );
    });

    test('should spawn astro build with custom outDir', async () => {
      const options: BuildExecutorSchema = {
        outDir: 'custom-dist',
      };
      
      const resultPromise = buildExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['build', '--outDir', 'custom-dist'],
        expect.any(Object)
      );
    });

    test('should spawn astro build with config and verbose flags', async () => {
      const options: BuildExecutorSchema = {
        config: 'build.config.mjs',
        verbose: true,
        silent: true,
      };
      
      const resultPromise = buildExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['build', '--config', 'build.config.mjs', '--verbose', '--silent'],
        expect.any(Object)
      );
    });

    test('should return output path information', async () => {
      const options: BuildExecutorSchema = {
        outDir: 'dist',
      };
      
      const resultPromise = buildExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe('/workspace/apps/test-app/dist');
    });
  });

  describe('Preview Executor', () => {
    test('should spawn astro preview with default options', async () => {
      const options: PreviewExecutorSchema = {};
      
      const resultPromise = previewExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['preview'],
        expect.objectContaining({
          cwd: '/workspace/apps/test-app',
        })
      );
    });

    test('should spawn astro preview with custom port and host', async () => {
      const options: PreviewExecutorSchema = {
        port: 3000,
        host: 'localhost',
        open: true,
      };
      
      const resultPromise = previewExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['preview', '--port', '3000', '--host', 'localhost', '--open'],
        expect.any(Object)
      );
    });

    test('should spawn astro preview with custom outDir', async () => {
      const options: PreviewExecutorSchema = {
        outDir: 'build',
      };
      
      const resultPromise = previewExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['preview', '--outDir', 'build'],
        expect.any(Object)
      );
    });
  });

  describe('Check Executor', () => {
    test('should spawn astro check with default options', async () => {
      const options: CheckExecutorSchema = {};
      
      const resultPromise = checkExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['check'],
        expect.objectContaining({
          cwd: '/workspace/apps/test-app',
        })
      );
    });

    test('should spawn astro check with watch mode', async () => {
      const options: CheckExecutorSchema = {
        watch: true,
      };
      
      const resultPromise = checkExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['check', '--watch'],
        expect.any(Object)
      );
    });

    test('should spawn astro check with TypeScript config', async () => {
      const options: CheckExecutorSchema = {
        tsconfig: 'tsconfig.build.json',
        verbose: true,
      };
      
      const resultPromise = checkExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringContaining('astro'),
        ['check', '--tsconfig', 'tsconfig.build.json', '--verbose'],
        expect.any(Object)
      );
    });

    test('should handle type check failures', async () => {
      const options: CheckExecutorSchema = {};
      
      const resultPromise = checkExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 1); // Non-zero exit code indicates type errors
      }, 10);

      const result = await resultPromise;

      expect(result.success).toBe(false);
    });
  });

  describe('Binary Resolution', () => {
    test('should use correct binary path based on platform', () => {
      const originalPlatform = process.platform;
      
      // Test Windows
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      devExecutor({}, mockContext);
      
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.stringMatching(/astro\.cmd|astro/),
        expect.any(Array),
        expect.any(Object)
      );
      
      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    test('should handle missing project configuration gracefully', async () => {
      const contextWithoutProject = {
        ...mockContext,
        projectsConfigurations: {
          version: 2,
          projects: {}
        }
      };
      
      const resultPromise = devExecutor({}, contextWithoutProject);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      const result = await resultPromise;

      // Should still attempt to run, using projectName as root
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Integration', () => {
    test('should validate port numbers and fail gracefully', async () => {
      const options: DevExecutorSchema = {
        port: -1, // Invalid port
      };
      
      const result = await devExecutor(options, mockContext);
      
      // Should fail validation before spawning process
      expect(result.success).toBe(false);
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    test('should validate file paths and fail gracefully', async () => {
      // Mock fs to return false for config file existence
      vi.doMock('fs', () => ({
        existsSync: vi.fn((path) => {
          if (path.includes('invalid-config.mjs')) {
            return false;
          }
          return true;
        }),
      }));

      const options: DevExecutorSchema = {
        config: 'invalid-config.mjs',
      };
      
      const result = await devExecutor(options, mockContext);
      
      expect(result.success).toBe(false);
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('Command Line Argument Construction', () => {
    test('should properly handle boolean flags', async () => {
      const options: BuildExecutorSchema = {
        verbose: true,
        silent: true,
      };
      
      const resultPromise = buildExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      const spawnCall = mockSpawn.mock.calls[0];
      const args = spawnCall[1];
      
      expect(args).toContain('--verbose');
      expect(args).toContain('--silent');
    });

    test('should properly handle string arguments with values', async () => {
      const options: PreviewExecutorSchema = {
        port: 8080,
        host: '127.0.0.1',
        outDir: 'custom-build',
      };
      
      const resultPromise = previewExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      const spawnCall = mockSpawn.mock.calls[0];
      const args = spawnCall[1];
      
      expect(args).toEqual([
        'preview',
        '--port', '8080',
        '--host', '127.0.0.1',
        '--outDir', 'custom-build'
      ]);
    });

    test('should handle empty/undefined options gracefully', async () => {
      const options: DevExecutorSchema = {
        port: undefined,
        host: undefined,
        verbose: false,
      };
      
      const resultPromise = devExecutor(options, mockContext);
      
      setTimeout(() => {
        mockChildProcess.emit('close', 0);
      }, 10);

      await resultPromise;

      const spawnCall = mockSpawn.mock.calls[0];
      const args = spawnCall[1];
      
      expect(args).toEqual(['dev']);
    });
  });
});
