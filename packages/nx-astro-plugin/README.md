# Astro NX Plugin

A plugin for Nx that provides generators and executors for Astro projects.

> **Note**: This package is ESM-only. It requires Node.js 18+ and does not support CommonJS imports.

## Installation & Setup

To use this plugin in your Nx workspace, you need to add it to your `nx.json` configuration:

```json
{
  "plugins": [
    {
      "plugin": "astro-nx",
      "options": {}
    }
  ]
}
```

Alternatively, you can add it using the Nx CLI:

```bash
nx add astro-nx
```

## Generators

### init

Initialize a new Astro project using predefined templates.

#### Usage

```bash
nx generate astro-nx:init my-astro-app
```

#### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | string | ✅ | - | The name of the Astro project to generate |
| `template` | string | ❌ | `astro-minimal` | The template to use for project generation |
| `directory` | string | ❌ | `apps/` | The destination directory where the project will be created |
| `tags` | string | ❌ | - | Comma-separated tags for project categorization and linting |
| `skipInstall` | boolean | ❌ | `false` | Whether to skip dependency installation after project generation |
| `packageManager` | string | ❌ | - | Override the default package manager (either `jpd` or `pnpm`) |

#### Examples

```bash
# Basic usage
nx generate astro-nx:init my-blog

# Using a specific template
nx generate astro-nx:init my-blog --template=astro-mdx

# Skip dependency installation
nx generate astro-nx:init my-blog --skipInstall

# Use specific package manager
nx generate astro-nx:init my-blog --packageManager=jpd

# Add tags
nx generate astro-nx:init my-blog --tags="frontend,astro"
```

## Executors

### dev
Start the Astro development server

### build  
Build the Astro project for production

### preview
Preview the built Astro project

### check
Run Astro check for TypeScript and other issues

## Supported Templates

The plugin supports the following ForAstro templates:

| Template | Description |
|----------|-------------|
| `astro-minimal` | Basic Astro project with minimal configuration |
| `astro-vue` | Astro project with Vue.js integration |
| `astro-preact` | Astro project with Preact integration |
| `astro-mdx` | Astro project with MDX support for enhanced markdown |
| `astro-markdoc` | Astro project with Markdoc integration |
| `astro-asciidoc` | Astro project with AsciiDoc support |

All templates are sourced from the [ForAstro monorepo](https://github.com/louiss0/forastro) and include:
- UnoCSS for styling
- Iconify for icon management
- Pre-configured Astro setup
- TypeScript support

## Package Manager Behavior

The plugin follows a specific package manager resolution strategy:

1. **JPD First**: If JPD is available in the system, it will be used by default
2. **Fallback to pnpm**: If JPD is not available, the plugin will fall back to pnpm
3. **Manual Override**: You can explicitly specify the package manager using the `--packageManager` flag

### JPD Integration

[JPD](https://github.com/louiss0/jpd) is a custom package manager that provides enhanced JavaScript project management capabilities. When JPD is available, the plugin will:

- Use JPD for dependency installation
- Automatically commit changes after installation with conventional commit messages
- Follow JPD's project management conventions

### pnpm Fallback

When JPD is not available, the plugin uses pnpm as the fallback package manager:

```bash
# If JPD is not available, this is equivalent to:
pnpm install
```

## Template Requirements

This plugin expects templates to be located in a `templates/` directory at the root of your workspace. Each template should be named exactly as specified in the schema.

The generator will automatically:
- Copy template files to the new project directory
- Update the project's package.json name
- Configure Nx project configuration with appropriate targets
- Install dependencies using the resolved package manager
