# 6.0.0 (2025-08-11)

### 🩹 Fixes

- Make dependencies/optionalDependencies optional For utilitites they could be added! In asciidoc they are necessary! ([8a99d24](https://github.com/louiss0/forastro/commit/8a99d24))
- ⚠️  migrate from esbuild to tsup Esbuild created an asciidoc build that I couldn't debug. I decided to switch to tsup! Tsup must be installed in each individual package in order to run properly. It also requires each build script is removed from the `project.json` files. I needed to make it so that each time a build is finished. The readmme's are moved to the public folders for auto publishing! ([4c03ee0](https://github.com/louiss0/forastro/commit/4c03ee0))

### ⚠️  Breaking Changes

- For Asciidoc asciidoctorjs is external now!

### ❤️ Thank You

- Shelton Louis @louiss0