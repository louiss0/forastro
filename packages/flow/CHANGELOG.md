## 2.11.0 (2025-01-02)

### 🚀 Features

- add tags to each file to indicate that they are libraries ([c93e7ce](https://github.com/louiss0/forastro/commit/c93e7ce))
- Add principles from keep a changelog into the repo. ([53e5326](https://github.com/louiss0/forastro/commit/53e5326))
- **flow:** Add inclusive to Range. ([0f4412f](https://github.com/louiss0/forastro/commit/0f4412f))
- **flow:** Create the index file for flow ([e88e8ec](https://github.com/louiss0/forastro/commit/e88e8ec))

### 🩹 Fixes

- Put fragment in the  if Callback instead of outside of it. ([b5e5c6f](https://github.com/louiss0/forastro/commit/b5e5c6f))
- configure release it to only use npm publish false not dismiss npm ([8f0f1b9](https://github.com/louiss0/forastro/commit/8f0f1b9))
- try using name instead of npm name for release it ([849c367](https://github.com/louiss0/forastro/commit/849c367))
- change into the proper command for release script ([ddcb725](https://github.com/louiss0/forastro/commit/ddcb725))
- remove injected code from changelog ([efd523c](https://github.com/louiss0/forastro/commit/efd523c))
- remove pnpm publish from the configuration ([7308df6](https://github.com/louiss0/forastro/commit/7308df6))
- try to use the after releaes hook to make sure a package is released using pnpm ([7146462](https://github.com/louiss0/forastro/commit/7146462))
- try to use the after bump hook to make sure a package is released ([327fa0f](https://github.com/louiss0/forastro/commit/327fa0f))
- Revert changelog back to the way it was before release ([810548f](https://github.com/louiss0/forastro/commit/810548f))
- configure release it to publish the package before release ([e4a3443](https://github.com/louiss0/forastro/commit/e4a3443))
- Add homepage to the json files for each flow, remark-html-directives-integration, and utilities ([7d9eef2](https://github.com/louiss0/forastro/commit/7d9eef2))
- Remove all scripts associated with tsup from utilities and flow. ([83c595d](https://github.com/louiss0/forastro/commit/83c595d))
- **flow:** use type of in array instead of importing the type ([b0d7926](https://github.com/louiss0/forastro/commit/b0d7926))
- **flow&utilities:** using the test folder instead of src ([d6f7d44](https://github.com/louiss0/forastro/commit/d6f7d44))
- **flow:** use the package.json file ([0dfd2df](https://github.com/louiss0/forastro/commit/0dfd2df))
- **flow:** move test folder into the root ([e9ab97b](https://github.com/louiss0/forastro/commit/e9ab97b))

### ❤️ Thank You

- louiss0 @louiss0

<!--

* Guiding Principles
  * Changelogs are for humans, not machines.
  * There should be an entry for every single version.
  * The same types of changes should be grouped.
  * Versions and sections should be linkable.
  * The latest version comes first.
  * The release date of each version is displayed.
  * Mention whether you follow Semantic Versioning.

! Types of changes
  * Added for new features.
  * Changed for changes in existing functionality.
  * Deprecated for soon-to-be removed features.
  * Removed for now removed features.
  * Fixed for any bug fixes.
  * Security in case of vulnerabilities.

-->

# @forastro/flow

## [Unreleased]

## [2.5.4] - 2023-10-27

### Changed

- Decided to use `executeIf` and the new `executeIfElse` functions for `<Switch/>` and `<Case/>`.

### Fixed

- Remove dependency on buggy `3.1.2` version of `@forastro/utilities`

## [2.5.3] - 2023-10-02

### Fixed

- Add a homepage to the package.json file that links to the homepage for this project.

## [2.5.2] - 2023-08-17

### Fixed

- The architecture is changed the files are no longer bundled.
  - Code base is easier to manage

## [2.5.1]

### Fixed

The wrong version of `@forastro/utilities` was published to npm it was based on `npm publish` .

### Added

## [2.5.0] - 2023-06-25

### Removed

- There is no CJS support only ESM.

## [2.4.2] - 2023-05-24

This release is a readme fix release. I messed up release it.

## [2.4.1]

This release is a readme fix release.
 From nom on this read Me will contain all important info about this library.

## [2.4.0]

### Patch Changes

- Updated: Readme
- Updated dependencies
- @forastro/utilities@2.4.0

## [2.2.4]

### Patch Changes

- Fixed: Peer dependecy is now greater than 1.0.0 instead of just ^1.0.0
- Updated dependencies
  - @forastro/utilities@2.2.4

## [2.2.2]

### Patch Changes

- Changed arguments for the iterate function and its internal logic.
- The `<For/>` component has changed as well.
- Updated dependencies
  - @forastro/utilities@2.2.2

## [2.2.0]

### Minor Changes

- Added a component called `<Hide />` it will hide something when a value is `true`.
  You can also choose to cloak by passing in a cloak boolean to the component
  if you do it will display none instead

### Patch Changes

- Updated dependencies
  - @forastro/utilities@2.2.0

## [2.1.0]

### Patch Changes

- Updated dependencies
  - @forastro/utilities@2.1.0

## [2.0.0]

### Major Changes

- This package has all of the practical features that are needed for an Astro app to be built.

## [0.1.3]

### Patch Changes

- Fixed the files folder for both.
- Updated dependencies
  - @forastro/utilities@1.0.3

## [0.1.2]

### Patch Changes

- Changed where the main file is from src/index to just index types should be from the main package
- Updated dependencies
  - @forastro/utilities@1.0.2

## [0.1.1]

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @forastro/utilities@1.0.0

## [0.1.0]

### Minor Changes

- I added many features to this repo

### Patch Changes

- Updated dependencies
  - @forastro/utilities@0.1

## [0.0.0]

First release.
