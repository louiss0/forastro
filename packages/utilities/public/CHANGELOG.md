## 5.2.2 (2025-06-07)

### 🩹 Fixes

- remove make the debug name optional ([8675421](https://github.com/louiss0/forastro/commit/8675421))

### ❤️ Thank You

- louiss0 @louiss0

## 5.2.1 (2025-06-01)

### 🩹 Fixes

- merge js and d.ts files into single ts file  Types were broken after using the latest versions Typescript now only looks for specific files for bundling Esbuild can only make one ([d962523](https://github.com/louiss0/forastro/commit/d962523))

### ❤️ Thank You

- louiss0 @louiss0

## 5.2.0 (2025-06-01)

This was a version bump only for utilities to align it with other projects, there were no code changes.

## 5.1.7 (2025-06-01)

### 🩹 Fixes

- **utilities:** move link to the bundled types file into exports area ([25dad25](https://github.com/louiss0/forastro/commit/25dad25))

### ❤️ Thank You

- louiss0 @louiss0

## 5.1.6 (2025-05-31)

### 🩹 Fixes

- **utilities:** add link to the bundled types file ([9b771e2](https://github.com/louiss0/forastro/commit/9b771e2))

### ❤️ Thank You

- louiss0 @louiss0

## 5.1.5 (2025-05-31)

### 🩹 Fixes

- remove wrong fuction call in propsSchema ([92eb695](https://github.com/louiss0/forastro/commit/92eb695))

### ❤️ Thank You

- louiss0 @louiss0

## 5.1.4 (2025-05-31)

### 🩹 Fixes

- adjust conditionals in Projector to take into account all cases properly ([327e9bb](https://github.com/louiss0/forastro/commit/327e9bb))

### ❤️ Thank You

- louiss0 @louiss0

## 5.1.2 (2025-01-23)

### Fixes
- **utilities:** Change order or `createAstroFunctionalComponent` arguments **Astro went back to the original order**.
- **utilites** remove string check **Astro adds props to components**
- **utilites** remove string check **Astro adds props to components**

## 5.1.1 (2025-01-23)

### Fixes

- **utilities:** Change order or `createAstroFunctionalComponent` arguments **Astro changed the order**.
- **utilities** add check for if `slots.default` is a Promise in `Projector` **Astro adds props to components**

## 5.1.0 (2025-01-23)

### 🚀 Features

- **forastro:** Add ESbuild plugin to transform ts extension into js ones I'm doing this because I realized that people should rely on nu shell to transform files. Tt should be a part of the system. Doing this ensures ease of use ([40c116f](https://github.com/louiss0/forastro/commit/40c116f))

### 🩹 Fixes

- **utilities:** move createAstroFunctionalComponent to internal I ran into a bug where for astro utilites wouldn't build because the createAstroFunctional component was in the wrong file. ([ece95a7](https://github.com/louiss0/forastro/commit/ece95a7))
- **forastro:** fix paths to esbuild file in the projects config for utilities and asciidoc ([6b2183e](https://github.com/louiss0/forastro/commit/6b2183e))

### ❤️ Thank You

- louiss0 @louiss0

## 5.0.1 (2025-01-14)

The main purpose of this release is to write a better Read me.
This readme is important now because it leads to the docs.
It also gives the user some examples of what the library provides.


# 5.0.0 (2025-01-03)

### 🚀 Features

- add components as imports ([e0c859d](https://github.com/louiss0/forastro/commit/e0c859d))
- turn public folder into an assets folder ([76cbc52](https://github.com/louiss0/forastro/commit/76cbc52))
- add tags to each file to indicate that they are libraries ([c93e7ce](https://github.com/louiss0/forastro/commit/c93e7ce))
- Execute if and execute Unless now have type predicates allowing for type safe narrowing. ([945119b](https://github.com/louiss0/forastro/commit/945119b))
- create utilities for only getting data from collections ([1b4e883](https://github.com/louiss0/forastro/commit/1b4e883))
- Create useDefineTemplateAndProjector. ([c3f2d65](https://github.com/louiss0/forastro/commit/c3f2d65))

### 🩹 Fixes

- remove main and module and use exports instead  I discovered that exports aren't ignored by typescript instead main and module are ([6a65b6b](https://github.com/louiss0/forastro/commit/6a65b6b))
- remove content collection types from the library into a place to be tested It's best not to create an api around virual modules They are hard to update and change the file will turn into a set of snippets instead once tested ([1f6bcf9](https://github.com/louiss0/forastro/commit/1f6bcf9))
- allow astro files to be imported ([18b6f6d](https://github.com/louiss0/forastro/commit/18b6f6d))
- return undefined to check lint error ([50634ed](https://github.com/louiss0/forastro/commit/50634ed))
- remove released heading under changelog before release. ([de09508](https://github.com/louiss0/forastro/commit/de09508))
- Make sure projector default slot is accessed properly. ([4efc530](https://github.com/louiss0/forastro/commit/4efc530))
- use null coalesing operator to get value of expressions from storedSlot ([1b98fcb](https://github.com/louiss0/forastro/commit/1b98fcb))
- make sure object keys length is the same as the object being sent in first. ([e634d61](https://github.com/louiss0/forastro/commit/e634d61))
- Use better condition for checking if an the first param is an object with the a ([7956beb](https://github.com/louiss0/forastro/commit/7956beb))
- use proper object checking methods for Tempalter and Projector and remember to use and don't return from function at all ([0f90d2d](https://github.com/louiss0/forastro/commit/0f90d2d))
- write proper check for rather props are defined and don't use Object.freeze() unless props is an object ([d7dd73a](https://github.com/louiss0/forastro/commit/d7dd73a))
- Remove the condition that checks if the function is a child while template props are filled.  It's better to the projector adjust it's code to what is written in Templater. ([e8c50e8](https://github.com/louiss0/forastro/commit/e8c50e8))
- **utilities:** Remove all unused imports. ([12c04cc](https://github.com/louiss0/forastro/commit/12c04cc))
- Type `executeIf` `executeUnless`  `throwIf` `throwUnless` properly. ([a6cfe9e](https://github.com/louiss0/forastro/commit/a6cfe9e))
- remove args from function type. ([e4c3685](https://github.com/louiss0/forastro/commit/e4c3685))
- @forastro/utilities is not at 4.0.2 it's at 0.1 ([9c4f3c9](https://github.com/louiss0/forastro/commit/9c4f3c9))
- Remove all uses of the third argument from this codebase. ([ceb5836](https://github.com/louiss0/forastro/commit/ceb5836))
- Remove cause arg don't know what happened but it could be fixed later. ([18f1f31](https://github.com/louiss0/forastro/commit/18f1f31))
- Remove all referecnces to cjs in the repo. ([e04c50e](https://github.com/louiss0/forastro/commit/e04c50e))
- export types for flow ([29462dc](https://github.com/louiss0/forastro/commit/29462dc))
- Add the ./components entry point to make sure /components is accessible. ([3d3adc2](https://github.com/louiss0/forastro/commit/3d3adc2))
- bugs after merge. ([023b9a8](https://github.com/louiss0/forastro/commit/023b9a8))
- **utilities:** use proper entry points in package.json file ([a8e736f](https://github.com/louiss0/forastro/commit/a8e736f))
- Move files properly to make tsup build properly. ([c5aa734](https://github.com/louiss0/forastro/commit/c5aa734))
- Move exports from helpers/index.ts into index.ts file. ([fe60df9](https://github.com/louiss0/forastro/commit/fe60df9))
- **utilities:** change structure to prevent circular dependencies ([40f3e1b](https://github.com/louiss0/forastro/commit/40f3e1b))
- refactor all utils to use only relative paths. ([61faf84](https://github.com/louiss0/forastro/commit/61faf84))
- Add homepage to the json files for each flow, remark-html-directives-integration, and utilities ([7d9eef2](https://github.com/louiss0/forastro/commit/7d9eef2))
- Make callback type use any for args and return type to be usable ([d2c0a81](https://github.com/louiss0/forastro/commit/d2c0a81))
- Make callback type use any for args and return type to be usable ([2f8ed4e](https://github.com/louiss0/forastro/commit/2f8ed4e))
- Remove all scripts associated with tsup from utilities and flow. ([83c595d](https://github.com/louiss0/forastro/commit/83c595d))
- **utilities:** wrong bump ([bf383d1](https://github.com/louiss0/forastro/commit/bf383d1))
- **utilities:** Lint errors in changelog are fixed ([3fcf207](https://github.com/louiss0/forastro/commit/3fcf207))
- **utilities:** Remove types from exports ([7180fc7](https://github.com/louiss0/forastro/commit/7180fc7))
- **flow&utilities:** using the test folder instead of src ([d6f7d44](https://github.com/louiss0/forastro/commit/d6f7d44))
- **utilities:** change dist into src ([79ec11c](https://github.com/louiss0/forastro/commit/79ec11c))
- **utilities:** Moved components to the /src folder ([5e5c5af](https://github.com/louiss0/forastro/commit/5e5c5af))

### ❤️ Thank You

- louiss0 @louiss0

## 4.12.0 (2025-01-02)

### 🚀 Features

- add components as imports ([e0c859d](https://github.com/louiss0/forastro/commit/e0c859d))
- turn public folder into an assets folder ([76cbc52](https://github.com/louiss0/forastro/commit/76cbc52))
- add tags to each file to indicate that they are libraries ([c93e7ce](https://github.com/louiss0/forastro/commit/c93e7ce))
- Execute if and execute Unless now have type predicates allowing for type safe narrowing. ([945119b](https://github.com/louiss0/forastro/commit/945119b))
- create utilities for only getting data from collections ([1b4e883](https://github.com/louiss0/forastro/commit/1b4e883))
- Create useDefineTemplateAndProjector. ([c3f2d65](https://github.com/louiss0/forastro/commit/c3f2d65))

### 🩹 Fixes

- remove main and module and use exports instead  I discovered that exports aren't ignored by typescript instead main and module are ([6a65b6b](https://github.com/louiss0/forastro/commit/6a65b6b))
- remove content collection types from the library into a place to be tested It's best not to create an api around virual modules They are hard to update and change the file will turn into a set of snippets instead once tested ([1f6bcf9](https://github.com/louiss0/forastro/commit/1f6bcf9))
- allow astro files to be imported ([18b6f6d](https://github.com/louiss0/forastro/commit/18b6f6d))
- return undefined to check lint error ([50634ed](https://github.com/louiss0/forastro/commit/50634ed))
- Make sure projector default slot is accessed properly. ([4efc530](https://github.com/louiss0/forastro/commit/4efc530))
- use null coalesing operator to get value of expressions from storedSlot ([1b98fcb](https://github.com/louiss0/forastro/commit/1b98fcb))
- make sure object keys length is the same as the object being sent in first. ([e634d61](https://github.com/louiss0/forastro/commit/e634d61))
- Use better condition for checking if an the first param is an object with the a ([7956beb](https://github.com/louiss0/forastro/commit/7956beb))
- use proper object checking methods for Tempalter and Projector and remember to use and don't return from function at all ([0f90d2d](https://github.com/louiss0/forastro/commit/0f90d2d))
- write proper check for rather props are defined and don't use Object.freeze() unless props is an object ([d7dd73a](https://github.com/louiss0/forastro/commit/d7dd73a))
- Remove the condition that checks if the function is a child while template props are filled.  It's better to the projector adjust it's code to what is written in Templater. ([e8c50e8](https://github.com/louiss0/forastro/commit/e8c50e8))
- **utilities:** Remove all unused imports. ([12c04cc](https://github.com/louiss0/forastro/commit/12c04cc))
- Type `executeIf` `executeUnless`  `throwIf` `throwUnless` properly. ([a6cfe9e](https://github.com/louiss0/forastro/commit/a6cfe9e))
- remove args from function type. ([e4c3685](https://github.com/louiss0/forastro/commit/e4c3685))
- @forastro/utilities is not at 4.0.2 it's at 0.1 ([9c4f3c9](https://github.com/louiss0/forastro/commit/9c4f3c9))
- Remove all uses of the third argument from this codebase. ([ceb5836](https://github.com/louiss0/forastro/commit/ceb5836))
- Remove cause arg don't know what happened but it could be fixed later. ([18f1f31](https://github.com/louiss0/forastro/commit/18f1f31))
- Remove all referecnces to cjs in the repo. ([e04c50e](https://github.com/louiss0/forastro/commit/e04c50e))
- export types for flow ([29462dc](https://github.com/louiss0/forastro/commit/29462dc))
- Add the ./components entry point to make sure /components is accessible. ([3d3adc2](https://github.com/louiss0/forastro/commit/3d3adc2))
- bugs after merge. ([023b9a8](https://github.com/louiss0/forastro/commit/023b9a8))
- **utilities:** use proper entry points in package.json file ([a8e736f](https://github.com/louiss0/forastro/commit/a8e736f))
- Move files properly to make tsup build properly. ([c5aa734](https://github.com/louiss0/forastro/commit/c5aa734))
- Move exports from helpers/index.ts into index.ts file. ([fe60df9](https://github.com/louiss0/forastro/commit/fe60df9))
- **utilities:** change structure to prevent circular dependencies ([40f3e1b](https://github.com/louiss0/forastro/commit/40f3e1b))
- refactor all utils to use only relative paths. ([61faf84](https://github.com/louiss0/forastro/commit/61faf84))
- Add homepage to the json files for each flow, remark-html-directives-integration, and utilities ([7d9eef2](https://github.com/louiss0/forastro/commit/7d9eef2))
- Make callback type use any for args and return type to be usable ([d2c0a81](https://github.com/louiss0/forastro/commit/d2c0a81))
- Make callback type use any for args and return type to be usable ([2f8ed4e](https://github.com/louiss0/forastro/commit/2f8ed4e))
- Remove all scripts associated with tsup from utilities and flow. ([83c595d](https://github.com/louiss0/forastro/commit/83c595d))
- **utilities:** wrong bump ([bf383d1](https://github.com/louiss0/forastro/commit/bf383d1))
- **utilities:** Remove types from exports ([7180fc7](https://github.com/louiss0/forastro/commit/7180fc7))
- **flow&utilities:** using the test folder instead of src ([d6f7d44](https://github.com/louiss0/forastro/commit/d6f7d44))
- **utilities:** change dist into src ([79ec11c](https://github.com/louiss0/forastro/commit/79ec11c))
- **utilities:** Moved components to the /src folder ([5e5c5af](https://github.com/louiss0/forastro/commit/5e5c5af))

### ❤️ Thank You

- louiss0 @louiss0
