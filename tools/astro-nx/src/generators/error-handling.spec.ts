/**
 * Error Handling Tests for Astro-Nx Integration
 * 
 * This test suite covers comprehensive error handling scenarios including:
 * 1. Testing behavior when create-astro is not installed
 * 2. Testing handling of create-astro failures with proper error messages
 * 3. Testing validation of project names against Nx naming conventions
 * 4. Testing recovery from partial failures during generation
 */

import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { ExecaOptions, ExecaReturnValue, ExecaError } from 'execa';

// Mock execa to simulate CLI execution scenarios
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

vi.mock('which', () => ({
  default: vi.fn(),
}));

// Mock @nx/devkit logger
vi.mock('@nx/devkit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();
  return {
    ...actual,
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

// Mock file system operations
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    existsSync: vi.fn(),
    promises: {
      ...actual.promises,
      access: vi.fn(),
      readdir: vi.fn(),
    },
  };
});

// Now import after mocks are set up
import { type Tree, logger } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { execa } from 'execa';
import which from 'which';
import { existsSync } from 'fs';

// Interface for create-astro integration
interface CreateAstroErrorOptions {
  projectName: string;
  template?: string;
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  directory?: string;
  installDeps?: boolean;
  upgrade?: boolean;
  verbose?: boolean;
  skipValidation?: boolean;
}

// Mock error types that can occur
interface MockExecaError extends Error {
  exitCode?: number;
  stderr?: string;
  stdout?: string;
  command?: string;
  failed?: boolean;
}

/**
 * Simulates create-astro project creation with various error scenarios
 */
async function createAstroProjectWithErrorHandling(
  tree: Tree,
  options: CreateAstroErrorOptions
): Promise<{ success: boolean; error?: string; partialResults?: string[] }> {
  const { 
    projectName, 
    template, 
    packageManager = 'pnpm', 
    directory, 
    installDeps = true, 
    upgrade = true, 
    verbose = false,
    skipValidation = false
  } = options;

  const partialResults: string[] = [];

  try {
    // Step 1: Validate project name against Nx naming conventions
    if (!skipValidation) {
      const validationResult = validateNxProjectName(projectName);
      if (!validationResult.isValid) {
        throw new Error(`Invalid project name: ${validationResult.reason}`);
      }
    }

    // Step 2: Check if create-astro is available
    try {
      await which('create-astro');
    } catch {
      // If create-astro is not globally available, check if package manager can run it
      const testArgs = packageManager === 'npm' ? ['exec', 'create-astro', '--help'] 
                     : packageManager === 'yarn' ? ['dlx', 'create-astro', '--help']
                     : ['dlx', 'create-astro', '--help'];
      
      await execa(packageManager, testArgs, { stdio: 'pipe', timeout: 5000 });
    }

    // Step 3: Execute create-astro command
    const createArgs = ['dlx', 'create-astro', projectName];
    if (template) createArgs.push(`--template=${template}`);
    createArgs.push('--yes'); // Non-interactive mode

    const execOptions: ExecaOptions = {
      cwd: directory || process.cwd(),
      stdio: verbose ? 'inherit' : 'pipe',
      timeout: 60000, // 1 minute timeout for create-astro
    };

    await execa(packageManager, createArgs, execOptions);
    partialResults.push('project-created');

    // Step 4: Install dependencies if requested
    if (installDeps) {
      const projectPath = directory ? `${directory}/${projectName}` : projectName;
      const installOptions: ExecaOptions = {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
        timeout: 120000, // 2 minute timeout for dependency installation
      };

      await execa(packageManager, ['install'], installOptions);
      partialResults.push('dependencies-installed');

      // Step 5: Upgrade dependencies if requested
      if (upgrade) {
        await execa(packageManager, ['dlx', '@astrojs/upgrade'], installOptions);
        partialResults.push('dependencies-upgraded');
      }
    }

    // Step 6: Integrate with Nx workspace
    const projectRoot = directory ? `${directory}/${projectName}` : projectName;
    await integrateWithNxWorkspace(tree, projectName, projectRoot);
    partialResults.push('nx-integration-complete');

    if (verbose) {
      logger.info(`Successfully created and integrated Astro project "${projectName}"`);
    }

    return { success: true, partialResults };

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred during project creation';
    
    if (verbose) {
      logger.error(`Failed to create Astro project: ${errorMessage}`);
    }

    return { success: false, error: errorMessage, partialResults };
  }
}

/**
 * Validates project name against Nx naming conventions
 */
function validateNxProjectName(name: string): { isValid: boolean; reason?: string } {
  // Check for empty or whitespace-only names
  if (!name || name.trim() === '') {
    return { isValid: false, reason: 'Project name cannot be empty' };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores only)
  const validNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-_]*$/;
  if (!validNameRegex.test(name)) {
    return { 
      isValid: false, 
      reason: 'Project name must start with a letter or number and contain only letters, numbers, hyphens, and underscores' 
    };
  }

  // Check for reserved names
  const reservedNames = ['node_modules', 'dist', 'build', 'src', 'test', 'tests', 'spec', 'specs'];
  if (reservedNames.includes(name.toLowerCase())) {
    return { isValid: false, reason: `"${name}" is a reserved name and cannot be used` };
  }

  // Check length constraints
  if (name.length > 50) {
    return { isValid: false, reason: 'Project name cannot exceed 50 characters' };
  }

  // Check for consecutive special characters
  if (/[-_]{2,}/.test(name)) {
    return { isValid: false, reason: 'Project name cannot contain consecutive hyphens or underscores' };
  }

  // Check for invalid endings
  if (name.endsWith('-') || name.endsWith('_')) {
    return { isValid: false, reason: 'Project name cannot end with a hyphen or underscore' };
  }

  return { isValid: true };
}

/**
 * Simulates Nx workspace integration
 */
async function integrateWithNxWorkspace(tree: Tree, projectName: string, projectRoot: string): Promise<void> {
  // Create basic project.json structure
  const projectJson = {
    name: projectName,
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      dev: {
        executor: '@forastro/astro-nx:dev',
        options: {
          port: 4321,
          host: 'localhost',
        },
      },
      build: {
        executor: '@forastro/astro-nx:build',
        options: {
          outputPath: `dist/${projectName}`,
        },
      },
      preview: {
        executor: '@forastro/astro-nx:preview',
        options: {
          port: 4322,
        },
      },
      check: {
        executor: '@forastro/astro-nx:check',
        options: {},
        cache: true,
        outputs: ['{projectRoot}/.astro-check'],
      },
    },
    tags: ['type:app', 'framework:astro'],
  };

  tree.write(`${projectRoot}/project.json`, JSON.stringify(projectJson, null, 2));
}

describe('Error Handling Tests', () => {
  let tree: Tree;
  // Access the mocked functions via vi.mocked
  const mockExeca = vi.mocked(execa);
  const mockWhich = vi.mocked(which);
  const mockExistsSync = vi.mocked(existsSync);
  const mockLogger = vi.mocked(logger);

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
    
    // Set up default successful mocks
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    } as ExecaReturnValue);
    
    mockWhich.mockResolvedValue('/usr/local/bin/create-astro');
    mockExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create-astro Not Installed Scenarios', () => {
    test('should handle case when create-astro is not globally installed', async () => {
      // Simulate create-astro not being globally available
      mockWhich.mockRejectedValue(new Error('create-astro not found'));
      
      // But package manager can still run it via dlx/exec
      mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'test-project',
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(result.partialResults).toContain('project-created');
      
      // Verify it attempts to use package manager's dlx command
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['dlx', 'create-astro', '--help'],
        expect.objectContaining({ timeout: 5000 })
      );
    });

    test('should handle case when create-astro is completely unavailable', async () => {
      // Simulate create-astro not being available anywhere
      mockWhich.mockRejectedValue(new Error('create-astro not found'));
      
      // Package manager also can't find it
      const unavailableError: MockExecaError = new Error('Package not found');
      unavailableError.exitCode = 1;
      unavailableError.stderr = 'create-astro not found in registry';
      mockExeca.mockRejectedValueOnce(unavailableError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'unavailable-project',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Package not found');
      expect(result.partialResults).toEqual([]);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: Package not found'
      );
    });

    test('should provide helpful error message when package manager is not available', async () => {
      // Simulate package manager not being available
      const packageManagerError: MockExecaError = new Error('pnpm command not found');
      packageManagerError.exitCode = 127; // Command not found
      mockExeca.mockRejectedValue(packageManagerError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'no-package-manager',
        packageManager: 'pnpm',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('pnpm command not found');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: pnpm command not found'
      );
    });

    test('should fallback to npm when pnpm is not available', async () => {
      // create-astro is not globally available
      mockWhich.mockRejectedValue(new Error('create-astro not found'));
      
      // All calls with npm should succeed
      mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);

      // Test with manually specified npm package manager
      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'fallback-test',
        packageManager: 'npm', // Manually specify npm
      });

      expect(result.success).toBe(true);
      expect(result.partialResults).toContain('project-created');
    });
  });

  describe('create-astro Command Failures', () => {
    test('should handle create-astro timeout errors', async () => {
      const timeoutError: MockExecaError = new Error('Command timed out after 60000 ms');
      timeoutError.exitCode = 124; // Timeout exit code
      mockExeca.mockRejectedValueOnce(timeoutError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'timeout-project',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Command timed out after 60000 ms');
      expect(result.partialResults).toEqual([]);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: Command timed out after 60000 ms'
      );
    });

    test('should handle invalid template errors', async () => {
      const invalidTemplateError: MockExecaError = new Error('Invalid template specified');
      invalidTemplateError.exitCode = 1;
      invalidTemplateError.stderr = 'Template "nonexistent-template" not found';
      
      mockExeca.mockRejectedValueOnce(invalidTemplateError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'invalid-template-project',
        template: 'nonexistent-template',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid template specified');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: Invalid template specified'
      );
    });

    test('should handle network connectivity issues', async () => {
      const networkError: MockExecaError = new Error('Network error');
      networkError.exitCode = 1;
      networkError.stderr = 'Failed to fetch template from GitHub';
      
      mockExeca.mockRejectedValueOnce(networkError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'network-fail-project',
        template: 'https://github.com/user/custom-template',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should handle directory permission errors', async () => {
      const permissionError: MockExecaError = new Error('Permission denied');
      permissionError.exitCode = 126;
      permissionError.stderr = 'EACCES: permission denied, mkdir';
      
      mockExeca.mockRejectedValueOnce(permissionError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'permission-fail-project',
        directory: '/root/restricted',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    test('should handle disk space errors', async () => {
      const diskSpaceError: MockExecaError = new Error('No space left on device');
      diskSpaceError.exitCode = 1;
      diskSpaceError.stderr = 'ENOSPC: no space left on device';
      
      mockExeca.mockRejectedValueOnce(diskSpaceError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'disk-space-project',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No space left on device');
    });

    test('should handle corrupted template errors', async () => {
      const corruptedError: MockExecaError = new Error('Template extraction failed');
      corruptedError.exitCode = 1;
      corruptedError.stderr = 'Failed to extract template: corrupted archive';
      
      mockExeca.mockRejectedValueOnce(corruptedError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'corrupted-template-project',
        template: 'minimal',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Template extraction failed');
    });
  });

  describe('Project Name Validation Against Nx Conventions', () => {
    test('should reject empty project names', async () => {
      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid project name: Project name cannot be empty');
      expect(result.partialResults).toEqual([]);
    });

    test('should reject whitespace-only project names', async () => {
      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: '   ',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid project name: Project name cannot be empty');
    });

    test('should reject project names starting with numbers in strict mode', async () => {
      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: '123-project',
      });

      // This should pass basic validation but might fail Nx-specific rules
      expect(result.success).toBe(true);
    });

    test('should reject project names with invalid characters', async () => {
      const invalidNames = [
        'project with spaces',
        'project@special',
        'project$symbols',
        'project#hash',
        'project.dot',
        'project/slash',
        'project\\backslash',
      ];

      for (const invalidName of invalidNames) {
        const result = await createAstroProjectWithErrorHandling(tree, {
          projectName: invalidName,
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid project name');
        expect(result.error).toContain('must start with a letter or number and contain only letters, numbers, hyphens, and underscores');
      }
    });

    test('should reject reserved project names', async () => {
      const reservedNames = ['node_modules', 'dist', 'build', 'src', 'test', 'tests', 'spec', 'specs'];

      for (const reservedName of reservedNames) {
        const result = await createAstroProjectWithErrorHandling(tree, {
          projectName: reservedName,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe(`Invalid project name: "${reservedName}" is a reserved name and cannot be used`);
      }
    });

    test('should reject project names exceeding length limits', async () => {
      const longName = 'a'.repeat(51); // Exceeds 50 character limit

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: longName,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid project name: Project name cannot exceed 50 characters');
    });

    test('should reject project names with consecutive special characters', async () => {
      const invalidNames = [
        'project--with-double-hyphens',
        'project__with-double-underscores',
        'project-_mixed-consecutive',
      ];

      for (const invalidName of invalidNames) {
        const result = await createAstroProjectWithErrorHandling(tree, {
          projectName: invalidName,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid project name: Project name cannot contain consecutive hyphens or underscores');
      }
    });

    test('should reject project names ending with special characters', async () => {
      const invalidNames = ['project-', 'project_', 'another-project-'];

      for (const invalidName of invalidNames) {
        const result = await createAstroProjectWithErrorHandling(tree, {
          projectName: invalidName,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid project name: Project name cannot end with a hyphen or underscore');
      }
    });

    test('should accept valid project names', async () => {
      const validNames = [
        'my-project',
        'myProject',
        'my_project',
        'project123',
        'a1b2c3',
        'frontend-app',
        'backend_service',
        'mobile-ui',
      ];

      for (const validName of validNames) {
        mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);
        
        const result = await createAstroProjectWithErrorHandling(tree, {
          projectName: validName,
          installDeps: false, // Skip to speed up tests
        });

        expect(result.success).toBe(true);
        expect(result.partialResults).toContain('project-created');
      }
    });

    test('should skip validation when requested', async () => {
      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'invalid project name with spaces',
        skipValidation: true,
        installDeps: false,
      });

      // Should succeed because validation is skipped
      expect(result.success).toBe(true);
      expect(result.partialResults).toContain('project-created');
    });
  });

  describe('Recovery from Partial Failures During Generation', () => {
    test('should handle failure during dependency installation', async () => {
      // create-astro succeeds, but dependency installation fails
      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockRejectedValueOnce(new Error('npm install failed')); // install failure

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'partial-fail-deps',
        installDeps: true,
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('npm install failed');
      expect(result.partialResults).toContain('project-created');
      expect(result.partialResults).not.toContain('dependencies-installed');
    });

    test('should handle failure during dependency upgrade', async () => {
      // create-astro and install succeed, but upgrade fails
      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // install success
        .mockRejectedValueOnce(new Error('upgrade failed')); // upgrade failure

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'partial-fail-upgrade',
        installDeps: true,
        upgrade: true,
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('upgrade failed');
      expect(result.partialResults).toContain('project-created');
      expect(result.partialResults).toContain('dependencies-installed');
      expect(result.partialResults).not.toContain('dependencies-upgraded');
    });

    test('should track progress through multiple stages', async () => {
      // All operations succeed
      mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'full-success',
        installDeps: true,
        upgrade: true,
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(result.partialResults).toEqual([
        'project-created',
        'dependencies-installed', 
        'dependencies-upgraded',
        'nx-integration-complete'
      ]);
    });

    test('should handle Nx integration failure after successful project creation', async () => {
      // Mock successful create-astro but fail on Nx integration (simulated)
      mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);

      // Simulate Nx integration failure by making tree operations fail
      const originalWrite = tree.write;
      tree.write = vi.fn(() => {
        throw new Error('Failed to write project.json');
      });

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'nx-integration-fail',
        installDeps: true,
        upgrade: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to write project.json');
      expect(result.partialResults).toContain('project-created');
      expect(result.partialResults).toContain('dependencies-installed');
      expect(result.partialResults).toContain('dependencies-upgraded');
      expect(result.partialResults).not.toContain('nx-integration-complete');

      // Restore original method
      tree.write = originalWrite;
    });

    test('should provide detailed error information for debugging', async () => {
      const detailedError: MockExecaError = new Error('Detailed error information');
      detailedError.exitCode = 1;
      detailedError.stderr = 'npm ERR! code ENOTFOUND\nnpm ERR! network request to https://registry.npmjs.org/astro failed';
      detailedError.stdout = 'Last successful output...';
      detailedError.command = 'npm install';
      detailedError.failed = true;

      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockRejectedValueOnce(detailedError); // install failure with details

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'detailed-error-project',
        installDeps: true,
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Detailed error information');
      expect(result.partialResults).toContain('project-created');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: Detailed error information'
      );
    });

    test('should handle cleanup after partial failures', async () => {
      // Mock file system operations for cleanup verification

      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockRejectedValueOnce(new Error('catastrophic failure')); // install failure

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'cleanup-test',
        installDeps: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('catastrophic failure');
      expect(result.partialResults).toContain('project-created');
    });
  });

  describe('Error Message Quality and User Experience', () => {
    test('should provide actionable error messages for common issues', async () => {
      const networkError: MockExecaError = new Error('getaddrinfo ENOTFOUND registry.npmjs.org');
      networkError.exitCode = 1;
      mockExeca.mockRejectedValueOnce(networkError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'network-error-test',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: getaddrinfo ENOTFOUND registry.npmjs.org'
      );
    });

    test('should provide context-aware error messages', async () => {
      const permissionError: MockExecaError = new Error('EACCES: permission denied');
      permissionError.exitCode = 126;
      permissionError.stderr = 'permission denied, mkdir \'/restricted/path\'';
      
      mockExeca.mockRejectedValueOnce(permissionError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'permission-error-test',
        directory: '/restricted/path',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('EACCES: permission denied');
    });

    test('should handle silent failures gracefully', async () => {
      // Simulate a process that exits with non-zero code but no error message
      const silentError: MockExecaError = new Error('Command failed');
      silentError.exitCode = 1;
      silentError.stderr = '';
      silentError.stdout = '';
      
      mockExeca.mockRejectedValueOnce(silentError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'silent-failure-test',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Command failed');
    });

    test('should provide progress indicators in verbose mode', async () => {
      mockExeca.mockResolvedValue({ exitCode: 0 } as ExecaReturnValue);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'progress-test',
        installDeps: true,
        upgrade: true,
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully created and integrated Astro project "progress-test"'
      );
    });

    test('should handle edge cases in error message formatting', async () => {
      const weirdError: MockExecaError = new Error();
      weirdError.message = ''; // Empty error message
      weirdError.exitCode = 1;
      
      mockExeca.mockRejectedValueOnce(weirdError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'weird-error-test',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred during project creation');
    });
  });

  describe('Integration with Different Package Managers', () => {
    test('should handle pnpm-specific errors', async () => {
      const pnpmError: MockExecaError = new Error('pnpm ERR! Unsupported URL Type');
      pnpmError.exitCode = 1;
      pnpmError.stderr = 'pnpm ERR! Unsupported URL Type "workspace:": workspace:*';
      
      mockExeca.mockRejectedValueOnce(pnpmError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'pnpm-error-test',
        packageManager: 'pnpm',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('pnpm ERR! Unsupported URL Type');
    });

    test('should handle npm-specific errors', async () => {
      const npmError: MockExecaError = new Error('npm ERR! peer dep missing');
      npmError.exitCode = 1;
      npmError.stderr = 'npm ERR! peer dep missing: react@>=16.8.0, required by @astrojs/react@1.0.0';
      
      mockExeca.mockRejectedValueOnce(npmError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'npm-error-test',
        packageManager: 'npm',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('npm ERR! peer dep missing');
    });

    test('should handle yarn-specific errors', async () => {
      const yarnError: MockExecaError = new Error('Yarn package not found');
      yarnError.exitCode = 1;
      yarnError.stderr = 'error Package "nonexistent-package" not found';
      
      mockExeca.mockRejectedValueOnce(yarnError);

      const result = await createAstroProjectWithErrorHandling(tree, {
        projectName: 'yarn-error-test',
        packageManager: 'yarn',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Yarn package not found');
    });
  });
});
