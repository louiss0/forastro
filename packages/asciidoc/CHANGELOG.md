## 2.4.0 (2025-08-11)

### 🚀 Features

- **build:** configure nx release and package publishing ([8c11156](https://github.com/louiss0/forastro/commit/8c11156))

### ❤️ Thank You

- Shelton Louis @louiss0

## 2.3.4 (2025-08-11)

### 🩹 Fixes

- **asciidoc:** update build config to use lib folder and fix TypeScript exports without chunking ([705cb54](https://github.com/louiss0/forastro/commit/705cb54))

### ❤️ Thank You

- Shelton Louis @louiss0

## 2.3.3 (2025-08-07)

### 🩹 Fixes

- **shared/schema:** fix package.json schema for build script validation ([6912c38](https://github.com/louiss0/forastro/commit/6912c38))
- ⚠️  **asciidoc/loader:** remove pathe dependency and fix attribute transformation ([ee7bd0e](https://github.com/louiss0/forastro/commit/ee7bd0e))
- ⚠️  migrate from esbuild to tsup Esbuild created an asciidoc build that I couldn't debug. I decided to switch to tsup! Tsup must be installed in each individual package in order to run properly. It also requires each build script is removed from the `project.json` files. I needed to make it so that each time a build is finished. The readmme's are moved to the public folders for auto publishing! ([4c03ee0](https://github.com/louiss0/forastro/commit/4c03ee0))

### ⚠️  Breaking Changes

- **asciidoc/loader:** None - This is a patch fix that maintains API compatibility
- For Asciidoc asciidoctorjs is external now!

### ❤️ Thank You

- Shelton Louis @louiss0