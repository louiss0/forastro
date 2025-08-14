import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { ExecaOptions, ExecaReturnValue } from 'execa';

// Mock execa to avoid actual CLI calls
const mockExeca = vi.fn();
vi.mock('execa', () => ({
  execa: mockExeca,
}));

// Mock @nx/devkit logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
vi.mock('@nx/devkit', () => ({
  logger: mockLogger,
}));

// Interface for create-astro options
interface CreateAstroOptions {
  projectName: string;
  template?: string | 'minimal' | 'blog' | 'portfolio' | 'docs' | 'empty';
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  directory?: string;
  installDeps?: boolean;
  upgrade?: boolean;
  verbose?: boolean;
  typescript?: boolean;
  integrations?: string[];
  dryRun?: boolean;
  git?: boolean;
  skipFormat?: boolean;
}

/**
 * Creates an Astro project using create-astro CLI
 * This function invokes create-astro with various template and configuration options
 */
async function createAstroProject(options: CreateAstroOptions): Promise<{ success: boolean; error?: string }> {
  const { 
    projectName, 
    template, 
    packageManager = 'pnpm', 
    directory, 
    installDeps = true, 
    upgrade = true, 
    verbose = false,
    typescript = true,
    integrations = [],
    dryRun = false,
    git = true,
    skipFormat = false
  } = options;

  // Validate project name
  if (!projectName || projectName.trim() === '') {
    throw new Error('Project name is required');
  }

  // Build command arguments
  const args = ['dlx', 'create-astro', projectName];
  
  // Add template if specified
  if (template) {
    args.push(`--template=${template}`);
  }
  
  // Add configuration flags
  if (!typescript) {
    args.push('--no-typescript');
  }
  
  if (!git) {
    args.push('--no-git');
  }
  
  if (dryRun) {
    args.push('--dry-run');
  }
  
  if (skipFormat) {
    args.push('--skip-format');
  }
  
  // Add integrations
  if (integrations.length > 0) {
    args.push(`--integrations=${integrations.join(',')}`);
  }
  
  // Always add --yes for non-interactive mode in tests
  args.push('--yes');
  
  if (verbose) {
    args.push('--verbose');
    mockLogger.info(`Creating Astro project "${projectName}"${template ? ` with template "${template}"` : ''}`);
  }

  // Execution options
  const execOptions: ExecaOptions = {
    cwd: directory || process.cwd(),
    stdio: verbose ? 'inherit' : 'pipe',
    env: { ...process.env },
  };

  try {
    // Execute create-astro command
    await mockExeca(packageManager, args, execOptions);

    if (installDeps && !dryRun) {
      if (verbose) {
        mockLogger.info('Installing dependencies...');
      }
      
      // Change to project directory and install dependencies
      const projectPath = directory ? `${directory}/${projectName}` : projectName;
      const installOptions: ExecaOptions = {
        cwd: projectPath,
        stdio: verbose ? 'inherit' : 'pipe',
      };

      await mockExeca(packageManager, ['install'], installOptions);

      if (upgrade) {
        if (verbose) {
          mockLogger.info('Upgrading dependencies...');
        }
        await mockExeca(packageManager, ['dlx', '@astrojs/upgrade'], installOptions);
      }
    }

    if (verbose) {
      mockLogger.info(`Successfully created Astro project "${projectName}"`);
    }

    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred during project creation';
    
    if (verbose) {
      mockLogger.error(`Failed to create Astro project: ${errorMessage}`);
    }

    return { success: false, error: errorMessage };
  }
}

describe('Create Astro CLI Execution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful execa calls by default
    mockExeca.mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    } as ExecaReturnValue);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Project Name Validation', () => {
    test('should require project name', async () => {
      await expect(createAstroProject({
        projectName: '',
      })).rejects.toThrow('Project name is required');
      
      await expect(createAstroProject({
        projectName: '   ',
      })).rejects.toThrow('Project name is required');
    });

    test('should accept valid project names', async () => {
      const validNames = ['my-site', 'blog-app', 'portfolio2024', 'docs_site'];
      
      for (const projectName of validNames) {
        const result = await createAstroProject({ projectName });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Template Options', () => {
    test('should work without template (default)', async () => {
      await createAstroProject({
        projectName: 'default-project',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        [
          'dlx',
          'create-astro',
          'default-project',
          '--yes'
        ],
        expect.any(Object)
      );
    });

    test('should accept built-in Astro templates', async () => {
      const builtInTemplates = ['minimal', 'blog', 'portfolio', 'docs', 'empty'];
      
      for (const template of builtInTemplates) {
        vi.clearAllMocks();
        
        const result = await createAstroProject({
          projectName: 'test-project',
          template,
        });

        expect(result.success).toBe(true);
        expect(mockExeca).toHaveBeenCalledWith(
          'pnpm',
          expect.arrayContaining([
            'dlx',
            'create-astro',
            'test-project',
            `--template=${template}`,
            '--yes'
          ]),
          expect.any(Object)
        );
      }
    });

    test('should accept GitHub repository templates', async () => {
      const githubTemplates = [
        'withastro/astro/examples/blog',
        'user/repo',
        'organization/template-repo/sub-folder'
      ];
      
      for (const template of githubTemplates) {
        vi.clearAllMocks();
        
        const result = await createAstroProject({
          projectName: 'github-project',
          template,
        });

        expect(result.success).toBe(true);
        expect(mockExeca).toHaveBeenCalledWith(
          'pnpm',
          expect.arrayContaining([`--template=${template}`]),
          expect.any(Object)
        );
      }
    });

    test('should accept URL templates', async () => {
      const result = await createAstroProject({
        projectName: 'url-project',
        template: 'https://github.com/user/astro-template',
      });

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--template=https://github.com/user/astro-template']),
        expect.any(Object)
      );
    });
  });

  describe('Command Construction', () => {
    test('should construct correct create-astro command with pnpm', async () => {
      await createAstroProject({
        template: 'minimal',
        projectName: 'my-astro-site',
        packageManager: 'pnpm',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        [
          'dlx',
          'create-astro',
          'my-astro-site',
          '--template=minimal',
          '--yes'
        ],
        expect.objectContaining({
          cwd: process.cwd(),
          stdio: 'pipe',
        })
      );
    });

    test('should construct correct create-astro command with npm', async () => {
      await createAstroProject({
        template: 'blog',
        projectName: 'blog-app',
        packageManager: 'npm',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'npm',
        [
          'dlx',
          'create-astro',
          'blog-app',
          '--template=blog',
          '--yes'
        ],
        expect.any(Object)
      );
    });

    test('should construct correct create-astro command with yarn', async () => {
      await createAstroProject({
        template: 'portfolio',
        projectName: 'my-portfolio',
        packageManager: 'yarn',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'yarn',
        [
          'dlx',
          'create-astro',
          'my-portfolio',
          '--template=portfolio',
          '--yes'
        ],
        expect.any(Object)
      );
    });

    test('should handle verbose mode', async () => {
      await createAstroProject({
        template: 'docs',
        projectName: 'documentation',
        verbose: true,
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--verbose']),
        expect.objectContaining({
          stdio: 'inherit',
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating Astro project "documentation" with template "docs"'
      );
    });

    test('should handle custom directory', async () => {
      await createAstroProject({
        template: 'minimal',
        projectName: 'site',
        directory: '/custom/path',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.any(Array),
        expect.objectContaining({
          cwd: '/custom/path',
        })
      );
    });

    test('should handle TypeScript flag', async () => {
      await createAstroProject({
        projectName: 'js-project',
        typescript: false,
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--no-typescript']),
        expect.any(Object)
      );
    });

    test('should handle git flag', async () => {
      await createAstroProject({
        projectName: 'no-git-project',
        git: false,
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--no-git']),
        expect.any(Object)
      );
    });

    test('should handle dry-run mode', async () => {
      await createAstroProject({
        projectName: 'test-project',
        dryRun: true,
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--dry-run']),
        expect.any(Object)
      );
    });

    test('should handle skip-format flag', async () => {
      await createAstroProject({
        projectName: 'unformatted-project',
        skipFormat: true,
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--skip-format']),
        expect.any(Object)
      );
    });

    test('should handle integrations', async () => {
      await createAstroProject({
        projectName: 'integrated-project',
        integrations: ['react', 'tailwind', 'sitemap'],
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--integrations=react,tailwind,sitemap']),
        expect.any(Object)
      );
    });

    test('should construct complex command with multiple options', async () => {
      await createAstroProject({
        projectName: 'complex-project',
        template: 'blog',
        packageManager: 'yarn',
        typescript: false,
        git: false,
        integrations: ['react', 'tailwind'],
        verbose: true,
        directory: '/workspace',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'yarn',
        [
          'dlx',
          'create-astro',
          'complex-project',
          '--template=blog',
          '--no-typescript',
          '--no-git',
          '--integrations=react,tailwind',
          '--yes',
          '--verbose'
        ],
        expect.objectContaining({
          cwd: '/workspace',
          stdio: 'inherit',
        })
      );
    });
  });

  describe('Dependency Installation', () => {
    test('should install dependencies by default', async () => {
      await createAstroProject({
        projectName: 'test-site',
      });

      // Verify create-astro was called
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['dlx', 'create-astro']),
        expect.any(Object)
      );

      // Verify dependency installation was called
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['install'],
        expect.objectContaining({
          cwd: 'test-site',
        })
      );

      // Verify upgrade was called
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['dlx', '@astrojs/upgrade'],
        expect.objectContaining({
          cwd: 'test-site',
        })
      );
    });

    test('should skip dependency installation when disabled', async () => {
      await createAstroProject({
        projectName: 'no-deps-app',
        installDeps: false,
      });

      // Should only call create-astro, not install or upgrade
      expect(mockExeca).toHaveBeenCalledTimes(1);
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['dlx', 'create-astro']),
        expect.any(Object)
      );
    });

    test('should skip upgrade when disabled', async () => {
      await createAstroProject({
        projectName: 'no-upgrade-site',
        upgrade: false,
      });

      // Should call create-astro and install, but not upgrade
      expect(mockExeca).toHaveBeenCalledTimes(2);
      expect(mockExeca).not.toHaveBeenCalledWith(
        'pnpm',
        ['dlx', '@astrojs/upgrade'],
        expect.any(Object)
      );
    });

    test('should skip installation in dry-run mode', async () => {
      await createAstroProject({
        projectName: 'dry-run-project',
        dryRun: true,
      });

      // Should only call create-astro with dry-run, no install or upgrade
      expect(mockExeca).toHaveBeenCalledTimes(1);
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--dry-run']),
        expect.any(Object)
      );
    });

    test('should handle dependency installation with custom directory', async () => {
      await createAstroProject({
        projectName: 'custom-dir-project',
        directory: '/projects',
      });

      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        ['install'],
        expect.objectContaining({
          cwd: '/projects/custom-dir-project',
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle create-astro command failure', async () => {
      const mockError = new Error('create-astro failed');
      mockExeca.mockRejectedValueOnce(mockError);

      const result = await createAstroProject({
        template: 'minimal',
        projectName: 'failed-project',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('create-astro failed');
    });

    test('should handle dependency installation failure', async () => {
      // Mock create-astro success, but install failure
      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockRejectedValueOnce(new Error('npm install failed')); // install failure

      const result = await createAstroProject({
        template: 'vue',
        projectName: 'install-fail',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('npm install failed');
    });

    test('should handle upgrade failure gracefully', async () => {
      // Mock create-astro and install success, but upgrade failure
      mockExeca
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // create-astro success
        .mockResolvedValueOnce({ exitCode: 0 } as ExecaReturnValue) // install success
        .mockRejectedValueOnce(new Error('upgrade failed')); // upgrade failure

      const result = await createAstroProject({
        template: 'markdoc',
        projectName: 'upgrade-fail',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('upgrade failed');
    });

    test('should log errors in verbose mode', async () => {
      const mockError = new Error('Command execution failed');
      mockExeca.mockRejectedValueOnce(mockError);

      const result = await createAstroProject({
        template: 'preact',
        projectName: 'error-project',
        verbose: true,
      });

      expect(result.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Astro project: Command execution failed'
      );
    });
  });

  describe('Integration-Specific Configurations', () => {
    test('should handle common Astro integrations', async () => {
      const integrationTests = [
        { integrations: ['react'], desc: 'React integration' },
        { integrations: ['vue'], desc: 'Vue integration' },
        { integrations: ['svelte'], desc: 'Svelte integration' },
        { integrations: ['solid-js'], desc: 'Solid.js integration' },
        { integrations: ['preact'], desc: 'Preact integration' },
        { integrations: ['tailwind'], desc: 'Tailwind CSS integration' },
        { integrations: ['mdx'], desc: 'MDX integration' },
        { integrations: ['sitemap'], desc: 'Sitemap integration' },
        { integrations: ['partytown'], desc: 'Partytown integration' },
        { integrations: ['react', 'tailwind', 'sitemap'], desc: 'Multiple integrations' },
      ];

      for (const test of integrationTests) {
        vi.clearAllMocks();
        
        await createAstroProject({
          projectName: 'integration-test',
          integrations: test.integrations,
        });

        expect(mockExeca).toHaveBeenCalledWith(
          'pnpm',
          expect.arrayContaining([`--integrations=${test.integrations.join(',')}`]),
          expect.any(Object)
        );
      }
    });

    test('should handle empty integrations array', async () => {
      await createAstroProject({
        projectName: 'no-integrations',
        integrations: [],
      });

      const [, args] = mockExeca.mock.calls[0];
      expect(args).not.toContain(expect.stringMatching(/--integrations=/));
    });
  });

  describe('Integration Tests', () => {
    test('should complete full project creation workflow', async () => {
      const result = await createAstroProject({
        projectName: 'full-featured-project',
        template: 'blog',
        packageManager: 'pnpm',
        directory: '/workspace',
        installDeps: true,
        upgrade: true,
        verbose: true,
        typescript: true,
        git: true,
        integrations: ['react', 'tailwind', 'sitemap'],
      });

      expect(result.success).toBe(true);

      // Verify all expected commands were called in order
      expect(mockExeca).toHaveBeenCalledTimes(3);
      
      // 1. Create Astro project with all options
      expect(mockExeca).toHaveBeenNthCalledWith(
        1,
        'pnpm',
        [
          'dlx',
          'create-astro',
          'full-featured-project',
          '--template=blog',
          '--integrations=react,tailwind,sitemap',
          '--yes',
          '--verbose'
        ],
        expect.objectContaining({
          cwd: '/workspace',
          stdio: 'inherit',
        })
      );

      // 2. Install dependencies
      expect(mockExeca).toHaveBeenNthCalledWith(
        2,
        'pnpm',
        ['install'],
        expect.objectContaining({
          cwd: '/workspace/full-featured-project',
          stdio: 'inherit',
        })
      );

      // 3. Upgrade dependencies
      expect(mockExeca).toHaveBeenNthCalledWith(
        3,
        'pnpm',
        ['dlx', '@astrojs/upgrade'],
        expect.objectContaining({
          cwd: '/workspace/full-featured-project',
          stdio: 'inherit',
        })
      );

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating Astro project "full-featured-project" with template "blog"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Installing dependencies...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Upgrading dependencies...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully created Astro project "full-featured-project"'
      );
    });

    test('should handle minimal project creation', async () => {
      const result = await createAstroProject({
        projectName: 'minimal-project',
        installDeps: false,
        verbose: false,
      });

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledTimes(1);
      
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        [
          'dlx',
          'create-astro',
          'minimal-project',
          '--yes'
        ],
        expect.objectContaining({
          cwd: process.cwd(),
          stdio: 'pipe',
        })
      );
    });

    test('should handle JavaScript-only project with specific template', async () => {
      const result = await createAstroProject({
        projectName: 'js-portfolio',
        template: 'portfolio',
        typescript: false,
        git: false,
        packageManager: 'yarn',
        integrations: ['tailwind'],
      });

      expect(result.success).toBe(true);
      
      expect(mockExeca).toHaveBeenNthCalledWith(
        1,
        'yarn',
        [
          'dlx',
          'create-astro',
          'js-portfolio',
          '--template=portfolio',
          '--no-typescript',
          '--no-git',
          '--integrations=tailwind',
          '--yes'
        ],
        expect.any(Object)
      );
    });

    test('should handle dry-run mode without post-processing', async () => {
      const result = await createAstroProject({
        projectName: 'dry-run-test',
        template: 'docs',
        dryRun: true,
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(mockExeca).toHaveBeenCalledTimes(1); // Only create-astro, no install/upgrade
      
      expect(mockExeca).toHaveBeenCalledWith(
        'pnpm',
        expect.arrayContaining(['--dry-run']),
        expect.any(Object)
      );
    });
  });
});
