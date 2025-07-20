import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import generator from './generator';
import { MigrateGeneratorSchema } from './schema';

describe('migrate generator', () => {
  let tree: Tree;
  const options: MigrateGeneratorSchema = {
    name: 'test-project',
    directory: 'apps/test-project',
    useJpd: false,
    convertScripts: true,
    skipFormat: true,
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should detect Astro project correctly', async () => {
    // Setup an Astro project
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        astro: '^4.0.0',
      },
      scripts: {
        dev: 'astro dev',
        build: 'astro build',
        preview: 'astro preview',
      },
    }));
    tree.write('apps/test-project/astro.config.mjs', `export default {};`);

    await generator(tree, options);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.name).toBe('apps-test-project');
    expect(projectJson.targets).toBeDefined();
    expect(projectJson.targets.dev).toBeDefined();
    expect(projectJson.targets.build).toBeDefined();
    expect(projectJson.targets.preview).toBeDefined();
  });

  it('should convert package.json scripts to Nx targets', async () => {
    // Setup an Astro project with custom scripts
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        astro: '^4.0.0',
      },
      scripts: {
        dev: 'astro dev',
        build: 'astro build',
        test: 'vitest',
        'test:watch': 'vitest --watch',
        typecheck: 'tsc --noEmit',
      },
    }));
    tree.write('apps/test-project/astro.config.mjs', `export default {};`);

    await generator(tree, options);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.targets.test).toBeDefined();
    expect(projectJson.targets.test.executor).toBe('@nx/workspace:run-commands');
    expect(projectJson.targets.test.options.command).toBe('vitest');
    expect(projectJson.targets['test:watch']).toBeDefined();
    expect(projectJson.targets.typecheck).toBeDefined();
  });

  it('should use JPD executor when useJpd flag is true', async () => {
    const jpdOptions = { ...options, useJpd: true };
    
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        astro: '^4.0.0',
      },
      scripts: {
        test: 'vitest',
      },
    }));
    tree.write('apps/test-project/astro.config.mjs', `export default {};`);

    await generator(tree, jpdOptions);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.targets.test.executor).toBe('nx:run-commands');
  });

  it('should not convert scripts when convertScripts is false', async () => {
    const noConvertOptions = { ...options, convertScripts: false };
    
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        astro: '^4.0.0',
      },
      scripts: {
        test: 'vitest',
        customScript: 'echo "hello"',
      },
    }));
    tree.write('apps/test-project/astro.config.mjs', `export default {};`);

    await generator(tree, noConvertOptions);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.targets.test).toBeUndefined();
    expect(projectJson.targets.customScript).toBeUndefined();
    // Should still have the base Astro targets
    expect(projectJson.targets.dev).toBeDefined();
    expect(projectJson.targets.build).toBeDefined();
  });

  it('should throw error when no Astro project is detected', async () => {
    // Setup a non-Astro project
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        react: '^18.0.0',
      },
    }));

    await expect(generator(tree, options)).rejects.toThrow(
      'Cannot detect Astro project in apps/test-project'
    );
  });

  it('should handle different Astro config file extensions', async () => {
    // Test with .ts config
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      dependencies: {
        astro: '^4.0.0',
      },
    }));
    tree.write('apps/test-project/astro.config.ts', `export default {};`);

    await generator(tree, options);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.name).toBe('apps-test-project');
  });

  it('should handle astro in devDependencies', async () => {
    tree.write('apps/test-project/package.json', JSON.stringify({
      name: 'test-project',
      devDependencies: {
        astro: '^4.0.0',
      },
    }));
    tree.write('apps/test-project/astro.config.mjs', `export default {};`);

    await generator(tree, options);

    const projectJson = readJson(tree, 'apps/test-project/project.json');
    expect(projectJson.name).toBe('apps-test-project');
  });
});
