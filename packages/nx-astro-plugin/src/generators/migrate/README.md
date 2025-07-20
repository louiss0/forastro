# Migrate Generator

The migrate generator allows you to convert an existing Astro project into an Nx workspace project. It automatically detects Astro projects and creates the necessary `project.json` configuration with properly wired targets.

## Usage

```bash
nx g @astro-nx/astro:migrate my-astro-project
```

### With options

```bash
nx g @astro-nx/astro:migrate my-astro-project --directory=apps/my-astro-project --convertScripts=false
```

## Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `name` | | `string` | | The name of the project to migrate |
| `directory` | `dir` | `string` | | The directory where the existing Astro project is located |
| `convertScripts` | | `boolean` | `true` | Convert package.json scripts to Nx targets |
| `skipFormat` | | `boolean` | `false` | Skip formatting files |

## Features

### Astro Project Detection

The generator automatically detects Astro projects by checking for:
- `package.json` with `astro` dependency (in dependencies or devDependencies)
- Astro configuration file (`astro.config.mjs`, `astro.config.ts`, or `astro.config.js`)

### Nx Target Creation

Creates a `project.json` file with the following default targets:
- `dev` - Start development server using `@astro-nx/astro:dev`
- `build` - Build the project using `@astro-nx/astro:build`
- `preview` - Preview the built project using `@astro-nx/astro:preview`
- `lint` - Lint the project using `@nx/eslint:lint`

### Script Conversion

When `convertScripts` is enabled (default), the generator will convert existing `package.json` scripts to Nx targets:
- Scripts are converted to `@nx/workspace:run-commands` targets
- Existing Nx targets (dev, build, preview, lint) are not overwritten

## Examples

### Basic migration
```bash
nx g @astro-nx/astro:migrate my-blog
```

### Migrate with custom directory
```bash
nx g @astro-nx/astro:migrate portfolio --directory=apps/portfolio
```

### Migrate without converting scripts
```bash
nx g @astro-nx/astro:migrate my-app --convertScripts=false
```

## Error Handling

The generator will throw an error if:
- No `package.json` file is found in the specified directory
- No Astro configuration file is found
- The `astro` dependency is not found in `package.json`

## Output

After successful migration, the generator will:
- Create `project.json` with configured targets
- Display the list of available targets
- Provide usage instructions for running targets
