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
  - generate-content: sample content based on integrations
  - page, component, layout, collection-schema, starlight-docs
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
- Generate content:
  - pnpm nx g @forastro/nx-astro-plugin:generate-content --project=my-site --presets=blog --mdxExamples=true

Notes
- The plugin detects the invoking package manager (JPD > pnpm > npm/yarn) based on user agent when commands run.
- ESLint is not forced. If ESLint is already present, Astro lint can be configured accordingly.
- This plugin supports only package-based Nx workspaces.
- CI-centric workflows using GitHub Actions are supported; configure Nx Release for publishing (NPM_TOKEN required).