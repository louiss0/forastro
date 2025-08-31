import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { ExecaReturnValue } from 'execa';

// Mock execa with more complex behaviors
const mockExeca = vi.fn();
vi.mock('execa', () => ({
  execa: mockExeca,
}));

// Mock @nx/devkit
const mockFormatFiles = vi.fn();
const mockInstallPackagesTask = vi.fn();
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

vi.mock('@nx/devkit', () => ({
  formatFiles: mockFormatFiles,
  installPackagesTask: mockInstallPackagesTask,
  logger: mockLogger,
}));

// Enhanced interface for comprehensive testing
interface PostGenerationTasksOptions {
  projectName: string;
  projectPath: string;
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  install?: boolean;
  git?: boolean;
  skipFormat?: boolean;
  verbose?: boolean;
  dependencies?: string[];
  devDependencies?: string[];
  timeout?: number;
  retries?: number;
  // Additional real-world options
  skipGitCommit?: boolean;
  customGitMessage?: string;
  formatCommand?: string[];
  lintOnFormat?: boolean;
  skipLockfile?: boolean;
}

interface TaskResult {
  success: boolean;
  error?: string;
  tasks: string[];
  duration?: number;
  warnings?: string[];
}

/**
 * Enhanced post-generation tasks implementation with real-world considerations
 */
async function runEnhancedPostGenerationTasks(
  tree: Tree,
  options: PostGenerationTasksOptions
): Promise<TaskResult> {
  const startTime = Date.now();
  const tasks: string[] = [];
  const warnings: string[] = [];
  
  const {
    projectName,
    projectPath,
    packageManager = 'pnpm',
    install = true,
    git = true,
    skipFormat = false,
    verbose = false,
    dependencies = [],
    devDependencies = [],
    timeout = 30000,
    retries = 3,
    skipGitCommit = false,
    customGitMessage = 'Initial commit',
    formatCommand = ['format'],
    lintOnFormat = true,
    skipLockfile = false,
  } = options;

  try {
    // Task 1: Validate environment and prerequisites
    tasks.push('validate-environment');
    await validateEnvironment(projectPath, packageManager, verbose);

    // Task 2: Install dependencies with retry logic
    if (install && (dependencies.length > 0 || devDependencies.length > 0)) {
      tasks.push('install-dependencies');
      await installDependenciesWithRetry(
        projectPath,
        packageManager,
        dependencies,
        devDependencies,
        retries,
        timeout,
        skipLockfile,
        verbose,
        warnings
      );
    }

    // Task 3: Initialize git with customizable options
    if (git) {
      tasks.push('init-git');
      await initializeGitRepository(
        projectPath,
        skipGitCommit,
        customGitMessage,
        verbose,
        warnings
      );
    }

    // Task 4: Format code with linting option
    if (!skipFormat) {
      tasks.push('format-code');
      await formatCodeWithLinting(
        tree,
        projectPath,
        formatCommand,
        lintOnFormat,
        verbose,
        warnings
      );
    }

    // Task 5: Post-installation hooks and validation
    tasks.push('post-install-validation');
    await runPostInstallValidation(projectPath, packageManager, verbose, warnings);

    // Task 6: Final cleanup and optimization
    tasks.push('cleanup');

    const duration = Date.now() - startTime;

    if (verbose) {
      mockLogger.info(
        `Successfully completed all post-generation tasks for ${projectName} in ${duration}ms`
      );
    }

    return {
      success: true,
      tasks,
      duration,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error occurred during post-generation tasks';
    
    tasks.push('cleanup-on-failure');
    
    if (verbose) {
      mockLogger.error(
        `Post-generation tasks failed for ${projectName} after ${duration}ms: ${errorMessage}`
      );
    }

    // Enhanced cleanup with partial rollback
    await enhancedCleanupOnFailure(projectPath, packageManager, tasks, verbose);
    
    return {
      success: false,
      error: errorMessage,
      tasks,
      duration,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

async function validateEnvironment(
  projectPath: string,
  packageManager: string,
  verbose: boolean
): Promise<void> {
  if (verbose) {
    mockLogger.info('Validating environment...');
  }

  // Check if package manager is available
  try {
    await mockExeca(packageManager, ['--version'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error(`Package manager ${packageManager} is not available`);
  }

  // Check if git is available (if needed)
  try {
    await mockExeca('git', ['--version'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error('Git is not available');
  }
}

async function installDependenciesWithRetry(
  projectPath: string,
  packageManager: string,
  dependencies: string[],
  devDependencies: string[],
  retries: number,
  timeout: number,
  skipLockfile: boolean,
  verbose: boolean,
  warnings: string[]
): Promise<void> {
  const installWithTimeout = async (args: string[], attempt: number): Promise<void> => {
    if (verbose) {
      mockLogger.info(`Installing dependencies (attempt ${attempt}/${retries})...`);
    }

    const installArgs = [...args];
    if (skipLockfile) {
      if (packageManager === 'npm') {
        installArgs.push('--no-package-lock');
      } else if (packageManager === 'yarn') {
        installArgs.push('--no-lockfile');
      } else if (packageManager === 'pnpm') {
        installArgs.push('--no-lockfile');
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      await mockExeca(packageManager, installArgs, {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
        throw new Error(`Installation timed out after ${timeout}ms`);
      }
      
      if (attempt < retries) {
        warnings.push(`Installation attempt ${attempt} failed, retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return installWithTimeout(args, attempt + 1);
      }
      
      throw error;
    }
  };

  // Install production dependencies
  if (dependencies.length > 0) {
    await installWithTimeout(['add', ...dependencies], 1);
  }

  // Install development dependencies
  if (devDependencies.length > 0) {
    const devFlag = packageManager === 'npm' ? '--save-dev' : '--save-dev';
    await installWithTimeout(['add', devFlag, ...devDependencies], 1);
  }
}

async function initializeGitRepository(
  projectPath: string,
  skipGitCommit: boolean,
  customGitMessage: string,
  verbose: boolean,
  warnings: string[]
): Promise<void> {
  if (verbose) {
    mockLogger.info('Initializing git repository...');
  }

  // Check if git is already initialized
  try {
    await mockExeca('git', ['rev-parse', '--git-dir'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
    warnings.push('Git repository already exists, skipping initialization');
    return;
  } catch {
    // Not a git repository, proceed with initialization
  }

  // Initialize git repository
  await mockExeca('git', ['init'], {
    cwd: projectPath,
    stdio: verbose ? 'inherit' : 'pipe',
  });

  // Set up initial git configuration if needed
  try {
    await mockExeca('git', ['config', 'user.name'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch {
    warnings.push('Git user.name not configured, using default');
    await mockExeca('git', ['config', 'user.name', 'Generator'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  }

  try {
    await mockExeca('git', ['config', 'user.email'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch {
    warnings.push('Git user.email not configured, using default');
    await mockExeca('git', ['config', 'user.email', 'generator@example.com'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  }

  if (!skipGitCommit) {
    // Add files to git
    await mockExeca('git', ['add', '.'], {
      cwd: projectPath,
      stdio: verbose ? 'inherit' : 'pipe',
    });

    // Create initial commit
    await mockExeca('git', ['commit', '-m', customGitMessage], {
      cwd: projectPath,
      stdio: verbose ? 'inherit' : 'pipe',
    });
  }
}

async function formatCodeWithLinting(
  tree: Tree,
  projectPath: string,
  formatCommand: string[],
  lintOnFormat: boolean,
  verbose: boolean,
  warnings: string[]
): Promise<void> {
  if (verbose) {
    mockLogger.info('Formatting code...');
  }

  // Format files using Nx formatFiles
  await mockFormatFiles(tree);

  // Run additional formatting command if specified
  if (formatCommand.length > 0) {
    try {
      await mockExeca('npx', formatCommand, {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      });
    } catch (error) {
      warnings.push(`Custom format command failed: ${formatCommand.join(' ')}`);
    }
  }

  // Run linting if enabled
  if (lintOnFormat) {
    try {
      await mockExeca('npx', ['eslint', '.', '--fix'], {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      });
    } catch (error) {
      warnings.push('Linting failed or no linting configuration found');
    }
  }
}

async function runPostInstallValidation(
  projectPath: string,
  packageManager: string,
  verbose: boolean,
  warnings: string[]
): Promise<void> {
  if (verbose) {
    mockLogger.info('Running post-installation validation...');
  }

  // Verify package.json exists and is valid
  try {
    await mockExeca('node', ['-e', 'JSON.parse(require("fs").readFileSync("package.json", "utf8"))'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch (error) {
    warnings.push('package.json is invalid or missing');
  }

  // Check if lockfile was created
  const lockfiles = {
    pnpm: 'pnpm-lock.yaml',
    npm: 'package-lock.json',
    yarn: 'yarn.lock',
  };

  try {
    await mockExeca('ls', [lockfiles[packageManager as keyof typeof lockfiles]], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch (error) {
    warnings.push(`${lockfiles[packageManager as keyof typeof lockfiles]} not found`);
  }
}

async function enhancedCleanupOnFailure(
  projectPath: string,
  packageManager: string,
  completedTasks: string[],
  verbose: boolean
): Promise<void> {
  if (verbose) {
    mockLogger.info('Running enhanced cleanup operations...');
  }

  // Only clean up what was actually created
  if (completedTasks.includes('init-git')) {
    try {
      await mockExeca('rm', ['-rf', '.git'], {
        cwd: projectPath,
        stdio: 'pipe',
      });
    } catch {
      // Ignore cleanup failures
    }
  }

  if (completedTasks.includes('install-dependencies')) {
    try {
      await mockExeca('rm', ['-rf', 'node_modules'], {
        cwd: projectPath,
        stdio: 'pipe',
      });
    } catch {
      // Ignore cleanup failures
    }

    // Remove lockfiles
    const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    for (const lockfile of lockfiles) {
      try {
        await mockExeca('rm', ['-f', lockfile], {
          cwd: projectPath,
          stdio: 'pipe',
        });
      } catch {
        // Ignore cleanup failures
      }
    }
  }
}

describe('Post-Generation Tasks Integration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();

    // Setup default successful responses
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    } as ExecaReturnValue);

    mockFormatFiles.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Environment Validation', () => {
    test('should fail when package manager is not available', async () => {
      mockExeca.mockImplementation((command, args) => {
        if (command === 'pnpm' && args[0] === '--version') {
          return Promise.reject(new Error('pnpm: command not found'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        packageManager: 'pnpm',
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Package manager pnpm is not available');
      expect(result.tasks).toContain('validate-environment');
    });

    test('should fail when git is not available', async () => {
      mockExeca.mockImplementation((command, args) => {
        if (command === 'git' && args[0] === '--version') {
          return Promise.reject(new Error('git: command not found'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Git is not available');
    });
  });

  describe('Retry Logic and Basic Error Handling', () => {
    test('should handle dependency installation failure', async () => {
      // Mock early failure to avoid timeout issues
      mockExeca.mockImplementation((command, args) => {
        if (command === 'pnpm' && args[0] === 'add') {
          return Promise.reject(new Error('Network error'));
        }
        if (command === 'pnpm' && args[0] === '--version') {
          return Promise.resolve({ exitCode: 0, stdout: '7.0.0', stderr: '' } as ExecaReturnValue);
        }
        if (command === 'git' && args[0] === '--version') {
          return Promise.resolve({ exitCode: 0, stdout: '2.0.0', stderr: '' } as ExecaReturnValue);
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
        verbose: true,
        retries: 1, // Reduce retries to prevent timeout
        timeout: 1000, // Short timeout
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('Git Repository Management', () => {
    test('should handle existing git repository', async () => {
      mockExeca.mockImplementation((command, args) => {
        if (command === 'git' && args[0] === 'rev-parse' && args[1] === '--git-dir') {
          return Promise.resolve({ exitCode: 0, stdout: '.git\n', stderr: '' } as ExecaReturnValue);
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Git repository already exists, skipping initialization');
      
      // Should not call git init
      expect(mockExeca).not.toHaveBeenCalledWith(
        'git',
        ['init'],
        expect.any(Object)
      );
    });

    test('should skip git commit when requested', async () => {
      // Mock to avoid the rev-parse check (not existing git repo)
      mockExeca.mockImplementation((command, args) => {
        if (command === 'git' && args[0] === 'rev-parse') {
          return Promise.reject(new Error('not a git repository'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
        skipGitCommit: true,
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      
      // Should call git init but not commit
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['init'],
        expect.any(Object)
      );
      expect(mockExeca).not.toHaveBeenCalledWith(
        'git',
        ['commit', '-m', expect.any(String)],
        expect.any(Object)
      );
    });

    test('should use custom git commit message', async () => {
      // Mock to avoid the rev-parse check (not existing git repo)
      mockExeca.mockImplementation((command, args) => {
        if (command === 'git' && args[0] === 'rev-parse') {
          return Promise.reject(new Error('not a git repository'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const customMessage = 'Custom initial commit';
      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        git: true,
        customGitMessage: customMessage,
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', customMessage],
        expect.any(Object)
      );
    });
  });

  describe('Advanced Formatting and Linting', () => {
    test('should run custom format command', async () => {
      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        skipFormat: false,
        formatCommand: ['prettier', '--write', '.'],
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(mockFormatFiles).toHaveBeenCalledWith(tree);
      expect(mockExeca).toHaveBeenCalledWith(
        'npx',
        ['prettier', '--write', '.'],
        expect.any(Object)
      );
    });

    test('should run linting when enabled', async () => {
      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        skipFormat: false,
        lintOnFormat: true,
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'npx',
        ['eslint', '.', '--fix'],
        expect.any(Object)
      );
    });

    test('should handle format command failure gracefully', async () => {
      mockExeca.mockImplementation((command, args) => {
        if (command === 'npx' && args[0] === 'prettier') {
          return Promise.reject(new Error('Prettier failed'));
        }
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        formatCommand: ['prettier', '--write', '.'],
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Custom format command failed: prettier --write .');
    });
  });

  describe('Package Manager Specific Features', () => {
    test('should handle --no-lockfile flag for different package managers', async () => {
      const packageManagers: Array<{manager: 'npm' | 'yarn' | 'pnpm', flag: string}> = [
        { manager: 'npm', flag: '--no-package-lock' },
        { manager: 'yarn', flag: '--no-lockfile' },
        { manager: 'pnpm', flag: '--no-lockfile' },
      ];

      for (const { manager, flag } of packageManagers) {
        vi.clearAllMocks();
        mockExeca.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);

        const options: PostGenerationTasksOptions = {
          projectName: 'test-app',
          projectPath: '/path/to/test-app',
          packageManager: manager,
          install: true,
          dependencies: ['react'],
          skipLockfile: true,
        };

        await runEnhancedPostGenerationTasks(tree, options);

        expect(mockExeca).toHaveBeenCalledWith(
          manager,
          expect.arrayContaining([flag]),
          expect.any(Object)
        );
      }
    });
  });

  describe('Post-Install Validation', () => {
    test('should validate package.json after installation', async () => {
      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.tasks).toContain('post-install-validation');
      
      // Should validate package.json
      expect(mockExeca).toHaveBeenCalledWith(
        'node',
        ['-e', 'JSON.parse(require("fs").readFileSync("package.json", "utf8"))'],
        expect.any(Object)
      );
    });

    test('should check for lockfile creation', async () => {
      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        packageManager: 'pnpm',
        install: true,
        dependencies: ['react'],
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'ls',
        ['pnpm-lock.yaml'],
        expect.any(Object)
      );
    });
  });

  describe('Performance and Timing', () => {
    test('should track task duration', async () => {
      // Add delay to ensure measurable duration
      mockExeca.mockImplementation(async (command, args) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        return Promise.resolve({ exitCode: 0, stdout: '', stderr: '' } as ExecaReturnValue);
      });

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        verbose: true,
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(true);
      expect(result.duration).toBeDefined();
      expect(typeof result.duration).toBe('number');
      expect(result.duration!).toBeGreaterThan(0);
    });

    test('should track duration even on failure', async () => {
      mockExeca.mockRejectedValueOnce(new Error('Task failed'));

      const options: PostGenerationTasksOptions = {
        projectName: 'test-app',
        projectPath: '/path/to/test-app',
        install: true,
        dependencies: ['react'],
      };

      const result = await runEnhancedPostGenerationTasks(tree, options);

      expect(result.success).toBe(false);
      expect(result.duration).toBeDefined();
      expect(typeof result.duration).toBe('number');
    });
  });
});
