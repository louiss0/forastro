# Nx workspace integration tests

The Nx Astro plugin test suite is located in
`packages/nx-astro-plugin/src`. It covers the generators, executors, and path,
package-manager, and Astro configuration utilities.

Run the complete plugin suite with:

```sh
NX_DAEMON=false pnpm nx test @forastro/nx-astro-plugin
```

The generator tests verify that projects, pages, layouts, content collections,
content files, components, integrations, and Starlight docs are written to the
Nx virtual `Tree`. They also verify that installation is returned as a deferred
Nx task and that generator options such as `skipInstall` and
`packageManager` are honored.

Executor tests mock `execa` and verify project-root resolution, Astro command
arguments, custom `build`/`preview` output directories, development roots, and
failure results.

For end-to-end Astro validation, run the generated example projects' check
and build targets:

```sh
NX_DAEMON=false pnpm nx run-many -t check --all --parallel=3
NX_DAEMON=false pnpm nx run-many -t build --all --parallel=1
```
