# Repository guide

This is a pnpm/Nx workspace for Astro libraries, examples, and templates.
Node.js 22.12+ and pnpm 11.24.0 are required.

## Projects

- `packages/asciidoc`: AsciiDoc content loader and styling integrations.
- `packages/utilities`: shared Astro utilities and publishable components.
- `packages/nx-astro-plugin`: Nx generators and executors for Astro.
- `apps/*`: private example applications.
- `templates/*`: private Astro starter projects used for build validation.

Only the three packages above are published. Build output is written to
`dist/packages/`.

## Development commands

Run Nx with its daemon disabled when reproducing CI behavior:

```sh
pnpm install --frozen-lockfile
NX_DAEMON=false pnpm nx run-many -t test --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t lint --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t type-check --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t check --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t build --all --parallel=1
pnpm run format:check
pnpm run verify:generated-app
pnpm run verify:packages
pnpm audit --prod --audit-level=moderate
```

The `ci` script runs the complete sequence. The package test targets include
both `src/**/__tests__` and colocated `*.spec.ts` files.

## Nx Astro plugin

Generators write to the virtual Nx `Tree`; they do not run a scaffold process
or mutate the filesystem directly. Installation is returned as a deferred Nx
task and can be disabled with `--skipInstall`. The app generator supports
TypeScript/JavaScript configs, integrations, ESLint selection, and package
manager selection. The content and collection generators target Astro 7's
central `src/content.config.ts`.

Executors resolve Astro from the project or workspace and pass supported
options through to the CLI. Build and preview accept `outDir`; dev accepts a
custom `root`.

## Packaging and release

Each publishable package has a build manifest generated from its source
manifest. Packages include built JavaScript, declarations, schemas/assets where
needed, README, CHANGELOG, and the MIT license. `verify:packages` runs builds,
Publint, tarball checks, and export/import checks.

Nx Release uses independent package versions and publishes from
`dist/{projectRoot}`. GitHub Actions runs complete verification before release;
NPM and Nx Cloud credentials are supplied through repository secrets.

## Contribution expectations

Keep tests close to behavior, use descriptive names, preserve cross-platform
path handling, and run the relevant package tests plus formatting before
submitting changes. Do not commit generated tarballs or credentials.
