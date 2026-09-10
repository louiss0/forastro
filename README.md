# For Astro Monorepo

This repository contains the maintained `@forastro` packages, example Astro
applications, and reusable Astro templates. It is an Nx workspace managed with
pnpm.

## Packages

| Package                     | Version | Purpose                                                  |
| --------------------------- | ------: | -------------------------------------------------------- |
| `@forastro/asciidoc`        |   2.5.1 | Astro 7 AsciiDoc content loader and styling integrations |
| `@forastro/utilities`       |   7.0.1 | Astro utilities and publishable components               |
| `@forastro/nx-astro-plugin` |   1.0.2 | Nx generators and executors for Astro workspaces         |

The `apps/` and `templates/` projects are examples and are not published
packages. Workspace dependencies use pnpm workspace links so template builds
exercise the current package sources.

## Requirements

- Node.js 22.12 or newer (CI uses Node.js 24)
- pnpm 11

Install dependencies with:

```sh
pnpm install
```

## Development commands

```sh
# Run all library tests
NX_DAEMON=false pnpm nx run-many -t test --all --parallel

# Check TypeScript and Astro projects
NX_DAEMON=false pnpm nx run-many -t type-check --all --parallel
NX_DAEMON=false pnpm nx run-many -t check --all --parallel

# Validate formatting and linting
pnpm run format:check
NX_DAEMON=false pnpm nx run-many -t lint --all --parallel

# Build and verify published package contents
pnpm run verify:generated-app
pnpm run verify:packages
```

`verify:generated-app` scaffolds an app into a temporary Nx tree and runs
`astro check` against it. `verify:packages` builds the three publishable
packages, runs Publint, packs them, and checks their required entry points and
package assets.

## Nx Astro plugin

The plugin supports generators for applications, pages, layouts, components,
content, collections, integrations, and Starlight documentation. Generators
write to the Nx virtual tree and defer package installation through Nx tasks,
so dry runs do not mutate the filesystem. For example:

```sh
NX_DAEMON=false pnpm nx g @forastro/nx-astro-plugin:app --name=my-site --directory=apps --skipInstall
NX_DAEMON=false pnpm nx g @forastro/nx-astro-plugin:page --project=my-site --name=post --type=dynamic
NX_DAEMON=false pnpm nx g @forastro/nx-astro-plugin:add-integration --project=my-site --names=mdx,react
```

See [`packages/nx-astro-plugin/README.md`](packages/nx-astro-plugin/README.md)
for generator and executor details.

## Release

Releases use independent Nx Release versioning for packages under
`packages/`. The automatic release workflow runs after pushes to `main`; a
manual release can be started with:

```sh
NX_DAEMON=false pnpm exec nx release
```

Publishing requires the `NPM_TOKEN` repository secret. Nx Cloud credentials
are supplied through the `NX_CLOUD_ACCESS_TOKEN` repository secret and are not
committed to this repository.

## License

MIT. See [`LICENSE`](LICENSE).
