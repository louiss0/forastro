# 7.0.0 (2025-10-07)

### 🚀 Features

- **nx-astro-plugin:** Nx Astro plugin and sample app; enable release dry-run ([#48](https://github.com/louiss0/forastro/pull/48))
- **apps:** move mock-blog from packages to apps and configure Nx TypeScript support ([5b7aee4](https://github.com/louiss0/forastro/commit/5b7aee4))
- **asciidoc:** enhance package with build outputs and configuration updates ([281c7b8](https://github.com/louiss0/forastro/commit/281c7b8))

### 🩹 Fixes

- **astro-nx:** align string utils, templates, and generators with tests - Refine slugify and case utilities (versions, brand terms, punctuation) - Use YAML frontmatter with quoted strings across templates - Honor overwrite option in generators; unify error messaging - Fix content generator getProjectPaths import; adjust tests accordingly ([c573e3c](https://github.com/louiss0/forastro/commit/c573e3c))

### ❤️ Thank You

- shelton louis @louiss0
- Shelton Louis @louiss0

# 6.0.0 (2025-08-11)

### 🩹 Fixes

- Make dependencies/optionalDependencies optional For utilitites they could be added! In asciidoc they are necessary! ([8a99d24](https://github.com/louiss0/forastro/commit/8a99d24))
- ⚠️  migrate from esbuild to tsup Esbuild created an asciidoc build that I couldn't debug. I decided to switch to tsup! Tsup must be installed in each individual package in order to run properly. It also requires each build script is removed from the `project.json` files. I needed to make it so that each time a build is finished. The readmme's are moved to the public folders for auto publishing! ([4c03ee0](https://github.com/louiss0/forastro/commit/4c03ee0))

### ⚠️  Breaking Changes

- For Asciidoc asciidoctorjs is external now!

### ❤️ Thank You

- Shelton Louis @louiss0