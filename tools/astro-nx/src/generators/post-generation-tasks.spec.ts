import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { Tree, GeneratorCallback } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { ExecaReturnValue } from 'execa';

// Mock execa to avoid actual CLI calls
const mockExeca = vi.fn();
vi.mock('execa', () => ({
  execa: mockExeca,
}));

// Mock @nx/devkit
const mockFormatFiles = vi.fn();
const mockRunTasksInSerial = vi.fn();
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

vi.mock('@nx/devkit', () => ({
  formatFiles: mockFormatFiles,
  runTasksInSerial: mockRunTasksInSerial,
  logger: mockLogger,
}));

// Mock fs operations
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    existsSync: vi.fn((path: string) => true),
    readFileSync: vi.fn((path: string) => {
      if (path.endsWith('package.json')) {
        return JSON.stringify({
          name: 'test-project',
          dependencies: {},
          devDependencies: {},
        });
      }
      return '';
    }),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Interface for post-generation options
interface PostGenerationOptions {
  projectName: string;
  projectPath: string;
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  install?: boolean;
  git?: boolean;
  skipFormat?: boolean;
  verbose?: boolean;
  dependencies?: string[];
  devDependencies?: string[];
}

/**
 * Mock implementation of post-generation tasks
 * This simulates the actual post-generation workflow that would run after project creation
 */
async function runPostGenerationTasks(
  tree: Tree,
  options: PostGenerationOptions
): Promise<{ success: boolean; error?: string; tasks: string[] }> {
  const tasks: string[] = [];
  const { 
    projectName, 
    projectPath, 
    packageManager = 'pnpm', 
    install = true, 
    git = true, 
    skipFormat = false,
    verbose = false,
    dependencies = [],
    devDependencies = []
  } = options;

  try {
    // Task 1: Install dependencies if install flag is true
    if (install && (dependencies.length > 0 || devDependencies.length > 0)) {
      if (verbose) {
        mockLogger.info(`Installing dependencies for ${projectName}...`);
      }
      
      tasks.push('install-dependencies');
      
      // Install production dependencies
      if (dependencies.length > 0) {
        await mockExeca(packageManager, ['add', ...dependencies], {
          cwd: projectPath,
          stdio: verbose ? 'inherit' : 'pipe',
        });
      }
      
      // Install development dependencies
      if (devDependencies.length > 0) {
        const devFlag = packageManager === 'npm' ? '--save-dev' : '--save-dev';
        await mockExeca(packageManager, ['add', devFlag, ...devDependencies], {
          cwd: projectPath,
          stdio: verbose ? 'inherit' : 'pipe',
        });
      }
    }

    // Task 2: Initialize git repository if git flag is true
    if (git) {
      if (verbose) {
        mockLogger.info(`Initializing git repository for ${projectName}...`);
      }
      
      tasks.push('init-git');
      
      // Initialize git repository
      await mockExeca('git', ['init'], {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      });
      
      // Add initial commit
      await mockExeca('git', ['add', '.'], {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      });
      
      await mockExeca('git', ['commit', '-m', 'Initial commit'], {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      });
    }

    // Task 3: Format code unless skipFormat is true
    if (!skipFormat) {
      if (verbose) {
        mockLogger.info(`Formatting code for ${projectName}...`);
      }
      
      tasks.push('format-code');
      await mockFormatFiles(tree);
    }

    // Task 4: Run any additional post-generation tasks
    tasks.push('cleanup');
    
    if (verbose) {
      mockLogger.info(`Successfully completed post-generation tasks for ${projectName}`);
    }

    return { success: true, tasks };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred during post-generation tasks';
    
    // Task 5: Cleanup operations on failure
    tasks.push('cleanup-on-failure');
    
    if (verbose) {
      mockLogger.error(`Post-generation tasks failed for ${projectName}: ${errorMessage}`);
    }
    
    // Attempt to clean up partial installations or git repos
    await cleanupOnFailure(projectPath, packageManager, verbose);
    
    return { success: false, error: errorMessage, tasks };
  }
}

/**
 * Cleanup operations when post-generation tasks fail
 */
async function cleanupOnFailure(
  projectPath: string,
  packageManager: string,
  verbose: boolean
): Promise<void> {
  try {
    if (verbose) {
      mockLogger.info('Running cleanup operations...');
    }
    
    // Remove partial git repository
    await mockExeca('rm', ['-rf', '.git'], {
      cwd: projectPath,
      stdio: 'pipe',
    }).catch(() => {}); // Ignore errors
    
    // Remove node_modules if they exist
    await mockExeca('rm', ['-rf', 'node_modules'], {
      cwd: projectPath,
      stdio: 'pipe',
    }).catch(() => {}); // Ignore errors
    
    // Remove package-lock or yarn.lock files
    await mockExeca('rm', ['-f', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'], {
      cwd: projectPath,
      stdio: 'pipe',
    }).catch(() => {}); // Ignore errors
    
  } catch (cleanupError) {
    if (verbose) {
      mockLogger.warn('Some cleanup operations failed, but continuing...');
    }
  }
}

describe('Post-Generation Tasks', () => {
  let tree: Tree;
  
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
    
    // Setup default mock return values
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    } as ExecaReturnValue);
    
    mockFormatFiles.mockResolvedValue(undefined);
    mockRunTasksInSerial.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Dependency Installation', () => {
    test('should install dependencies when install flag is true', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react', 'react-dom'],
        devDependencies: ['vite', '@types/react'],
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toContain('install-dependencies');

      // Verify production dependencies were installed
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['add', 'react', 'react-dom'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );

      // Verify dev dependencies were installed
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['add', '--save-dev', 'vite', '@types/react'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );
    });

    test('should skip dependency installation when install flag is false', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: false,
        dependencies: ['react', 'react-dom'],
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).not.toContain('install-dependencies');
      
      // Should not call package manager
      expect(mockExeca).not.toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['add']),
        expect.any(Object)
      );
    });

    test('should skip dependency installation when no dependencies provided', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: [],
        devDependencies: [],
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).not.toContain('install-dependencies');
      
      // Should not call package manager
      expect(mockExeca).not.toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['add']),
        expect.any(Object)
      );
    });

    test('should use correct package manager flags', async () => {
      const testCases = [
        { packageManager: 'npm' as const, devFlag: '--save-dev' },
        { packageManager: 'yarn' as const, devFlag: '--save-dev' },
        { packageManager: 'pnpm' as const, devFlag: '--save-dev' },
      ];

      for (const { packageManager, devFlag } of testCases) {
        vi.clearAllMocks();
        mockExeca.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);

        const options: PostGenerationOptions = {
          projectName: 'test-app',
          projectPath: '/path/to/test-app',
          packageManager,
          install: true,
          devDependencies: ['vite'],
        };

        await runPostGenerationTasks(tree, options);

        expect(mockExeca).toHaveBeenCalledWith(
          packageManager,
          ['add', devFlag, 'vite'],
          expect.any(Object)
        );
      }
    });
  });

  describe('Git Initialization', () => {
    test('should initialize git repository when git flag is true', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toContain('init-git');

      // Verify git init was called
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['init'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );

      // Verify git add was called
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['add', '.'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );

      // Verify initial commit was created
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'Initial commit'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );
    });

    test('should skip git initialization when git flag is false', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: false,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).not.toContain('init-git');

      // Should not call git commands
      expect(mockExeca).not.toHaveBeenCalledWith(
        'git',
        expect.any(Array),
        expect.any(Object)
      );
    });
  });

  describe('Code Formatting', () => {
    test('should format code when skipFormat is false', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        skipFormat: false,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toContain('format-code');
      expect(mockFormatFiles).toHaveBeenCalledWith(tree);
    });

    test('should skip code formatting when skipFormat is true', async () => {
      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        skipFormat: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).not.toContain('format-code');
      expect(mockFormatFiles).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling and Cleanup', () => {
    test('should handle dependency installation failure', async () => {
      // Mock execa to fail on dependency installation
      mockExeca.mockRejectedValueOnce(new Error('Package installation failed'));

      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
        verbose: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Package installation failed');
      expect(result.tasks).toContain('cleanup-on-failure');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Post-generation tasks failed for test-app')
      );
    });

    test('should handle git initialization failure', async () => {
      // Mock git init to fail
      mockExeca.mockImplementation((command, args) => {
        if (command === 'git' && args[0] === 'init') {
          return Promise.reject(new Error('Git initialization failed'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
        verbose: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Git initialization failed');
      expect(result.tasks).toContain('cleanup-on-failure');
    });

    test('should run cleanup operations on failure', async () => {
      mockExeca.mockRejectedValueOnce(new Error('Task failed'));

      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
        verbose: true,
      };

      await runPostGenerationTasks(tree, options);

      // Verify cleanup operations were attempted
      expect(mockExeca).toHaveBeenCalledWith(
        'rm',
        ['-rf', '.git'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );

      expect(mockExeca).toHaveBeenCalledWith(
        'rm',
        ['-rf', 'node_modules'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );

      expect(mockExeca).toHaveBeenCalledWith(
        'rm',
        ['-f', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
        expect.objectContaining({
          cwd: '/path/to/test-app',
        })
      );
    });

    test('should continue even if cleanup operations fail', async () => {
      // First call fails (main task)
      // Subsequent calls for cleanup also fail
      mockExeca
        .mockRejectedValueOnce(new Error('Main task failed'))
        .mockRejectedValue(new Error('Cleanup failed'));

      const options: PostGenerationOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
        verbose: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.tasks).toContain('cleanup-on-failure');
      // Should not throw an error even if cleanup fails
    });
  });

  describe('Integration Tests', () => {
    test('should run all tasks in correct order when all flags are true', async () => {
      const options: PostGenerationOptions = {
        projectName: 'full-app',
        projectPath: '/path/to/full-app',
        install: true,
        git: true,
        skipFormat: false,
        dependencies: ['react'],
        devDependencies: ['vite'],
        verbose: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toEqual([
        'install-dependencies',
        'init-git',
        'format-code',
        'cleanup',
      ]);

      // Verify all operations were called
      expect(mockExeca).toHaveBeenCalledWith('pnpm', ['add', 'react'], expect.any(Object));
      expect(mockExeca).toHaveBeenCalledWith('pnpm', ['add', '--save-dev', 'vite'], expect.any(Object));
      expect(mockExeca).toHaveBeenCalledWith('git', ['init'], expect.any(Object));
      expect(mockFormatFiles).toHaveBeenCalledWith(tree);
    });

    test('should skip all optional tasks when flags are false', async () => {
      const options: PostGenerationOptions = {
        projectName: 'minimal-app',
        projectPath: '/path/to/minimal-app',
        install: false,
        git: false,
        skipFormat: true,
      };

      const result = await runPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toEqual(['cleanup']);

      // Verify no operations were called except cleanup
      expect(mockExeca).not.toHaveBeenCalledWith('pnpm', expect.any(Array), expect.any(Object));
      expect(mockExeca).not.toHaveBeenCalledWith('git', expect.any(Array), expect.any(Object));
      expect(mockFormatFiles).not.toHaveBeenCalled();
    });

    test('should handle verbose logging correctly', async () => {
      const options: PostGenerationOptions = {
        projectName: 'verbose-app',
        projectPath: '/path/to/verbose-app',
        install: true,
        git: true,
        skipFormat: false,
        dependencies: ['react'],
        verbose: true,
      };

      await runPostGenerationTasks(tree, options);

      // Verify verbose logging was called
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Installing dependencies for verbose-app...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Initializing git repository for verbose-app...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Formatting code for verbose-app...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully completed post-generation tasks for verbose-app'
      );

      // Verify stdio is set to 'inherit' for verbose mode
      expect(mockExeca).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          stdio: 'inherit',
        })
      );
    });
  });
});
