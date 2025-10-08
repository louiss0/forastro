# @forastro/nx-astro-plugin

Nx plugin for Astro in package-based workspaces.

Why

- Scaffold Astro apps with create-astro non-interactively
- Configure integrations via astro add behind the scenes
- Generate content tailored to installed integrations
- Run Astro via Nx executors (dev/build/preview/check/sync)

What

- Generators:
  - init: prepare workspace defaults (no integrated mode)
  - app: create an Astro app using create-astro
  - add-integration: add/configure integrations (astro add)
  - content: generate content files with validation
  - page: generate static or dynamic pages
  - component, layout, collection-schema, starlight-docs
- Executors:
  - dev, build, preview, check, sync

How

- Installation (in this repo, package-based):
  - Build and pack locally:
    - pnpm -w nx build nx-astro-plugin
    - cd packages/nx-astro-plugin/dist && npm pack
  - Add to workspace (example):
    - pnpm -w add file:packages/nx-astro-plugin/dist/forastro-nx-astro-plugin-0.1.0.tgz

Usage

- Create an app (TS by default, no CSS framework):
  - pnpm nx g @forastro/nx-astro-plugin:app my-site --template=minimal --directory=apps --eslint=auto
- Run it:
  - pnpm nx dev my-site
  - pnpm nx build my-site && pnpm nx preview my-site
- Add integrations:
  - pnpm nx g @forastro/nx-astro-plugin:add-integration --project=my-site --names=mdx,react

Generators

Component Generator

- Generate server (Astro) components (default):
  - pnpm nx g @forastro/nx-astro-plugin:component --project=my-site --name="my button"
  - Creates: src/components/MyButton.astro with Props interface
- Generate client (framework) components:
  - Auto-detects installed integrations and selects framework automatically
  - pnpm nx g @forastro/nx-astro-plugin:component --project=my-site --name=Counter --type=client
  - If multiple frameworks installed, specify explicitly:
    - pnpm nx g @forastro/nx-astro-plugin:component --project=my-site --name=Counter --type=client --framework=react
- Supported client frameworks:
  - React: Generates component with hooks (useState, useEffect)
  - Preact: Generates component with signals (signal, computed, effect)
  - Vue: Generates .vue component with refs (ref, computed, onMounted)
  - Svelte: Generates .svelte component with runes ($state, $derived, $effect)
  - Angular: Generates standalone component with signals (signal, computed, effect)
- Custom directories:
  - pnpm nx g @forastro/nx-astro-plugin:component --project=my-site --name=Modal --directory=ui
  - Creates: src/components/ui/Modal.[ext]

Page Generator

- Generate static pages:
  - pnpm nx g @forastro/nx-astro-plugin:page --project=my-site --name=about
  - Creates: src/pages/about.astro with frontmatter and placeholder content
- Generate dynamic pages:
  - pnpm nx g @forastro/nx-astro-plugin:page --project=my-site --name=slug --type=dynamic
  - Creates: src/pages/[slug].astro with getStaticPaths() for content collections
  - Automatically detects srcDir from astro.config
- Custom directories:
  - pnpm nx g @forastro/nx-astro-plugin:page --project=my-site --name=blog/post --type=static
  - Creates: src/pages/blog/post.astro

Content Generator

- Generate markdown content:
  - pnpm nx g @forastro/nx-astro-plugin:content --project=my-site --collection=posts --contentType=markdown --name="My First Post"
  - Creates: src/content/posts/my-first-post.md with YAML frontmatter
- Generate MDX content (requires @astrojs/mdx):
  - pnpm nx g @forastro/nx-astro-plugin:content --project=my-site --collection=posts --contentType=mdx --name="Interactive Post"
  - Creates: src/content/posts/interactive-post.mdx
- Generate Markdoc content (requires @astrojs/markdoc):
  - pnpm nx g @forastro/nx-astro-plugin:content --project=my-site --collection=docs --contentType=markdoc --name="Getting Started"
  - Creates: src/content/docs/getting-started.md
- Generate AsciiDoc content (requires asciidoctor):
  - pnpm nx g @forastro/nx-astro-plugin:content --project=my-site --collection=posts --contentType=asciidoc --name="Technical Post"
  - Creates: src/content/posts/technical-post.adoc with AsciiDoc header

Validation Features

- Collection validation: Verifies collection exists, lists available collections if not found
- Content type validation: Checks for required integrations, provides installation instructions
- Automatic slugification: Converts names to URL-friendly slugs
- Directory detection: Reads astro.config for srcDir and contentDir settings

Notes

- The plugin detects the invoking package manager (JPD > pnpm > npm/yarn) based on user agent when commands run.
- ESLint is not forced. If ESLint is already present, Astro lint can be configured accordingly.
- This plugin supports only package-based Nx workspaces.
- CI-centric workflows using GitHub Actions are supported; configure Nx Release for publishing (NPM_TOKEN required).
