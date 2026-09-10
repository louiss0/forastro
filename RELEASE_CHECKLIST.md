# Release checklist

## Before release

- [ ] Set `NPM_TOKEN` in repository secrets with publish access to `@forastro/*`.
- [ ] Confirm `GITHUB_TOKEN` has contents write permission.
- [ ] Confirm `NX_CLOUD_ACCESS_TOKEN` is set as a repository secret when Nx
      Cloud is enabled.
- [ ] Run `pnpm install --frozen-lockfile`.
- [ ] Run the complete verification commands:

```sh
NX_DAEMON=false pnpm nx run-many -t test --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t lint --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t type-check --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t check --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t build --all --parallel=1
pnpm run format:check
pnpm run verify:packages
pnpm audit --prod --audit-level=moderate
```

## Release

The recommended path is the protected `main` branch. After the release
workflow's verification job succeeds, Nx Release publishes the independent
packages from `dist/packages/*`.

For a manual dry run:

```sh
NX_DAEMON=false pnpm exec nx release version --dry-run
NX_DAEMON=false pnpm exec nx release publish --dry-run
```

The automatic workflow runs only on pushes to `main`; `workflow_dispatch` is
available for an intentional manual run. Its concurrency group prevents
parallel release attempts.

## After release

- [ ] Verify package versions and exports on npm.
- [ ] Verify GitHub releases and generated changelogs.
- [ ] Test installation of each package in a clean Astro workspace.
