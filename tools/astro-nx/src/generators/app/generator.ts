import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  runTasksInSerial,
  joinPathFragments,
  names,
} from '@nx/devkit';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { safeWriteFile } from '../../internal/fs/tree-ops.js';
import { validateNonEmptyString, validateFileDoesNotExist, validateEnum } from '../../internal/validate/options.js';

export interface AppGeneratorSchema {
  name: string;
  directory?: string;
  tags?: string;
  skipFormat?: boolean;
  packageManager?: 'pnpm' | 'npm' | 'yarn' | 'jpd';
  reactQuery?: boolean;
  primeReact?: boolean;
  nuqs?: boolean;
  zod?: boolean;
  fontsource?: boolean;
}

interface NormalizedOptions extends AppGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  className: string;
  constantName: string;
  propertyName: string;
  fileName: string;
}

export default async function (tree: Tree, options: AppGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  // Apply standardized validations first
  validateNonEmptyString(options.name, 'name');
  validateEnum(options.packageManager, ['pnpm', 'npm', 'yarn', 'jpd'] as const, 'packageManager');
  
  const normalizedOptions = await normalizeOptions(tree, options);
  
  // Validate options
  await validateOptions(tree, normalizedOptions);
  
  // Create project structure
  await createProjectStructure(tree, normalizedOptions);
  
  // Generate configuration files
  await generateConfigurationFiles(tree, normalizedOptions);
  
  // Generate source files
  await generateSourceFiles(tree, normalizedOptions);
  
  // Generate project.json for Nx
  await generateNxProjectConfig(tree, normalizedOptions);
  
  // Generate package.json
  await generatePackageJson(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

async function normalizeOptions(_tree: Tree, options: AppGeneratorSchema): Promise<NormalizedOptions> {
  const name = names(options.name).fileName;
  
  // Handle directory structure
  const projectDirectory = options.directory
    ? joinPathFragments(options.directory, name)
    : name;
    
  const projectName = projectDirectory.replace(/\//g, '-');
  const projectRoot = joinPathFragments('apps', projectDirectory);
  
  // Parse tags
  const parsedTags = options.tags
    ? options.tags.split(',').map(t => t.trim())
    : [];
  
  // Generate names
  const { className, constantName, propertyName, fileName } = names(options.name);
  
  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    className,
    constantName,
    propertyName,
    fileName,
    name: fileName,
  };
}

async function validateOptions(tree: Tree, options: NormalizedOptions): Promise<void> {
  // Check if project name is valid
  if (!/^[a-zA-Z0-9-_]+$/.test(options.name)) {
    throw new Error(`Invalid project name "${options.name}". Only alphanumeric characters, hyphens, and underscores are allowed.`);
  }
  
  // Check if directory already exists using standardized validation
  validateFileDoesNotExist(tree, options.projectRoot);
}

async function createProjectStructure(tree: Tree, options: NormalizedOptions): Promise<void> {
  // Create basic directory structure
  const dirs = [
    options.projectRoot,
    joinPathFragments(options.projectRoot, 'src'),
    joinPathFragments(options.projectRoot, 'src', 'assets'),
    joinPathFragments(options.projectRoot, 'public'),
  ];
  
  for (const dir of dirs) {
    ensureTreeDirs(tree, dir);
  }
}

async function generateConfigurationFiles(tree: Tree, options: NormalizedOptions): Promise<void> {
  // Generate Vite config
  const viteConfig = generateViteConfig(options);
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'vite.config.ts'), viteConfig);
  
  // Generate UnoCSS config
  const unoConfig = generateUnoConfig();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'uno.config.ts'), unoConfig);
  
  // Generate ESLint config
  const eslintConfig = generateEslintConfig(options);
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'eslint.config.ts'), eslintConfig);
  
  // Generate Biome config
  const biomeConfig = generateBiomeConfig();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'biome.json'), biomeConfig);
  
  // Generate TypeScript configs
  const tsConfig = generateTsConfig();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'tsconfig.json'), tsConfig);
  
  const tsNodeConfig = generateTsNodeConfig();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'tsconfig.node.json'), tsNodeConfig);
}

async function generateSourceFiles(tree: Tree, options: NormalizedOptions): Promise<void> {
  // Generate index.html
  const indexHtml = generateIndexHtml(options);
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'index.html'), indexHtml);
  
  // Generate main.tsx
  const mainTsx = generateMainTsx(options);
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'src', 'main.tsx'), mainTsx);
  
  // Generate App.tsx
  const appTsx = generateAppTsx(options);
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'src', 'App.tsx'), appTsx);
  
  // Generate index.css
  const indexCss = generateIndexCss();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'src', 'index.css'), indexCss);
  
  // Generate vite-env.d.ts
  const viteEnvDts = generateViteEnvDts();
  safeWriteFile(tree, joinPathFragments(options.projectRoot, 'src', 'vite-env.d.ts'), viteEnvDts);
}

async function generateNxProjectConfig(tree: Tree, options: NormalizedOptions): Promise<void> {
  const projectConfig = {
    name: options.projectName,
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    projectType: 'application',
    sourceRoot: joinPathFragments(options.projectRoot, 'src'),
    targets: {
      dev: {
        executor: '@nx/vite:dev-server',
        defaultConfiguration: 'development',
        options: {
          buildTarget: `${options.projectName}:build`,
        },
        configurations: {
          development: {
            buildTarget: `${options.projectName}:build:development`,
            hmr: true,
          },
        },
      },
      build: {
        executor: '@nx/vite:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: joinPathFragments('dist', options.projectRoot),
        },
        configurations: {
          development: {
            mode: 'development',
          },
          production: {
            mode: 'production',
          },
        },
      },
      preview: {
        executor: '@nx/vite:preview-server',
        defaultConfiguration: 'development',
        options: {
          buildTarget: `${options.projectName}:build`,
        },
        configurations: {
          development: {
            buildTarget: `${options.projectName}:build:development`,
          },
          production: {
            buildTarget: `${options.projectName}:build:production`,
          },
        },
      },
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [joinPathFragments(options.projectRoot, '**/*.{ts,tsx,js,jsx}')],
        },
      },
    },
    tags: options.parsedTags,
  };
  
  safeWriteFile(
    tree,
    joinPathFragments(options.projectRoot, 'project.json'),
    JSON.stringify(projectConfig, null, 2)
  );
}

async function generatePackageJson(tree: Tree, options: NormalizedOptions): Promise<void> {
  const packageManager = options.packageManager === 'jpd' ? 'pnpm' : (options.packageManager || 'pnpm');
  
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };
  
  const devDependencies: Record<string, string> = {
    '@types/react': '^18.2.66',
    '@types/react-dom': '^18.2.22',
    '@vitejs/plugin-react': '^4.2.1',
    'vite': '^5.2.0',
    'typescript': '^5.2.2',
    'unocss': '^0.58.6',
    'vite-plugin-biome': '^1.0.0',
    '@biomejs/biome': '^1.7.0',
    'eslint': '^8.57.0',
    '@eslint/js': '^9.0.0',
    '@typescript-eslint/parser': '^7.0.0',
    '@typescript-eslint/eslint-plugin': '^7.0.0',
    'eslint-plugin-react': '^7.34.0',
    'eslint-plugin-react-hooks': '^4.6.0',
    'unplugin-icons': '^0.18.5',
    '@iconify/json': '^2.2.199',
  };
  
  // Add optional dependencies
  if (options.reactQuery) {
    dependencies['@tanstack/react-query'] = '^5.28.6';
    dependencies['axios'] = '^1.6.8';
    devDependencies['@tanstack/eslint-plugin-query'] = '^5.28.6';
  }
  
  if (options.primeReact) {
    dependencies['primereact'] = '^10.5.1';
    dependencies['primeicons'] = '^7.0.0';
  }
  
  if (options.nuqs) {
    dependencies['nuqs'] = '^1.17.4';
  }
  
  if (options.zod) {
    dependencies['zod'] = '^3.23.6';
  }
  
  if (options.fontsource) {
    devDependencies['unplugin-fonts'] = '^1.1.1';
  }
  
  const packageJson = {
    name: options.projectName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      preview: 'vite preview',
    },
    dependencies,
    devDependencies,
    packageManager: `${packageManager}@latest`,
  };
  
  safeWriteFile(
    tree,
    joinPathFragments(options.projectRoot, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

function generateViteConfig(options: NormalizedOptions): string {
  const imports = [
    "import { defineConfig } from 'vite';",
    "import react from '@vitejs/plugin-react';",
    "import UnoCSS from 'unocss/vite';",
    "import Icons from 'unplugin-icons/vite';",
    "import { biomePlugin } from 'vite-plugin-biome';",
  ];
  
  const plugins = [
    'UnoCSS(),',
    'Icons({ autoInstall: true, compiler: \'jsx\' }),',
    'react(),',
    "biomePlugin({ mode: 'format', applyFixes: true })",
  ];
  
  if (options.fontsource) {
    imports.push("import Unfonts from 'unplugin-fonts/vite';");
    plugins.unshift(`Unfonts({
      fontsource: {
        families: [
          'Open Sans',
          {
            name: 'Roboto',
            weights: [400, 700],
            styles: ['italic', 'normal'],
            subset: 'latin-ext',
          },
        ],
      },
    }),`);
  }
  
  return `${imports.join('\n')}

export default defineConfig({
  plugins: [
    ${plugins.join('\n    ')}
  ],
});
`;
}

function generateUnoConfig(): string {
  return `import { presetWind, transformerVariantGroup, defineConfig } from 'unocss';

// I won't use preset icons again. It's hard to size icons. 
export default defineConfig({
  presets: [
    // Use WindiCSS classes. 
    presetWind(),
  ],
  transformers: [
    // Enable variant groups.
    transformerVariantGroup(),  
  ],
  blocklist: [
    // Remove all variations of ma, ba, pa, variations  
    /^(?:(?:m|p|b)a-)/,
    // Remove all op|of|position|case|decoration|line-height|b|c classes.
    // They aren't a part of tailwind.
    /^(?:(?:op|of|position|case|decoration|line-height|b|c)-)/,
    // Remove all bg|text|border|outline classes with words and dash anything after.
    // They aren't a part of tailwind.
    /^(?:bg|text|border|outline)-(?:[a-z]+[A-Z][a-z]+)/,
    /^(?:bg|text|border|outline)-(?:[a-z]+)-[1-9]$/,
    // Remove all object- classes that have only one letter.
    // They aren't a part of tailwind.
    /^(?:object)-[a-z]{2}$/,
    // Remove all grid- classes that aren't grid-cols.
    // They aren't a part of tailwind.
    /^(grid)-(?!cols)/,
    // Remove all flex- classes that aren't flex-col.
    // They aren't a part of tailwind.
    /^(flex)-(?!col)/,
    // Remove all font|rounded- classes that have numbers.
    // They aren't a part of tailwind.
    /^(font|rounded)-\\d+/
  ],
});
`;
}

function generateEslintConfig(options: NormalizedOptions): string {
  const imports = [
    "// eslint.config.js",
    "import js from '@eslint/js';",
    "import ts from '@typescript-eslint/eslint-plugin';",
    "import tsParser from '@typescript-eslint/parser';",
    "import react from 'eslint-plugin-react';",
    "import hooks from 'eslint-plugin-react-hooks';",
  ];
  
  const plugins = [
    "'@typescript-eslint': ts,",
    "react,",
    "'react-hooks': hooks,",
  ];
  
  const rules = [
    "...js.configs.recommended.rules,",
    "...ts.configs.recommended.rules,",
    "...react.configs.flat.recommended.rules,",
    "...hooks.configs.recommended.rules,",
  ];
  
  if (options.reactQuery) {
    imports.push("import pluginQuery from '@tanstack/eslint-plugin-query';");
    rules.push("...pluginQuery.configs['flat/recommended'],");
  }
  
  return `${imports.join('\n')}

export default [
  {
    ignores: ['dist', 'node_modules'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
      globals: { browser: 'readonly', process: 'readonly' },
    },
    plugins: {
      ${plugins.join('\n      ')}
    },
    rules: {
      ${rules.join('\n      ')}
    },
    settings: {
      react: { version: 'detect' },
    },
    files: ['**/*.{ts,tsx,js,jsx}'],
  },
];
`;
}

function generateBiomeConfig(): string {
  return JSON.stringify({
    "$schema": "https://biomejs.dev/schemas/1.6.0/schema.json",
    "formatter": { "enabled": true },
    "linter": { "enabled": false }
  }, null, 2);
}

function generateTsConfig(): string {
  return JSON.stringify({
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }, null, 2);
}

function generateTsNodeConfig(): string {
  return JSON.stringify({
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }, null, 2);
}

function generateIndexHtml(options: NormalizedOptions): string {
  const acronyms = ['html', 'css', 'js', 'api', 'ui', 'ux', 'json', 'xml', 'http', 'https'];
  const title = options.name.split('-').map(word => {
    const lowerWord = word.toLowerCase();
    if (acronyms.includes(lowerWord)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function generateMainTsx(options: NormalizedOptions): string {
  const imports = [
    "import '@unocss/reset/tailwind.css'",
    "import 'virtual:uno.css'",
    "import 'virtual:unocss-devtools'",
  ];
  
  if (options.fontsource) {
    imports.push("import 'unfonts.css'");
  }
  
  imports.push(
    "import React from 'react'",
    "import ReactDOM from 'react-dom/client'",
    "import App from './App'"
  );
  
  let queryClientSetup = '';
  let queryProviderStart = '';
  let queryProviderEnd = '';
  
  if (options.reactQuery) {
    imports.push(
      "import { QueryClient, QueryClientProvider } from '@tanstack/react-query'",
      "import { ReactQueryDevtools } from '@tanstack/react-query-devtools'"
    );
    
    queryClientSetup = `
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000, // 5 minutes
    },
  },
});
`;
    
    queryProviderStart = `
    <QueryClientProvider client={queryClient}>`;
    queryProviderEnd = `
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>`;
  }
  
  return `${imports.join('\n')}
${queryClientSetup}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>${queryProviderStart}
    <App />${queryProviderEnd}
  </React.StrictMode>
)
`;
}

function generateAppTsx(options: NormalizedOptions): string {
  return `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-gray-900">Welcome to ${options.className}!</h1>
                <p>Your React Vite app is ready. Start editing to see changes.</p>
                <ul className="list-disc space-y-2">
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2">UnoCSS for styling</p>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2">TypeScript support</p>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2">ESLint + Biome for code quality</p>
                  </li>
                  ${options.reactQuery ? `<li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2">React Query for data fetching</p>
                  </li>` : ''}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

function generateIndexCss(): string {
  return `/* Base reset and utilities are handled by UnoCSS */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;
}

function generateViteEnvDts(): string {
  return `/// <reference types="vite/client" />
`;
}
