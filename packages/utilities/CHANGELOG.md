# @forastro/utilities

## [Unreleased]

### Added

## [2.6.0] - 2023-06-25

### Removed

- There is no CJS support only ESM.
  
### Changed

- Components are exported in `@forastro/utilities/components` instead of in main.

## [2.5.1] - 2023-05-24

This release is a readme fix release.
From nom on this read Me will contain all important info about this library.

## [2.5.0]

With this release the Sync Iterate function is added to the library.
This function is a `function` that takes in an iterable that needs a `forEach()`
It uses that iterable to loop through all keys and values just like iterate.

> [Warning] This function is meant to be used in Non Astro Components.

### Added

The function `syncIterate()` was added.

## [2.4.0]

### Minor Changes

- Removed: Island Mirror this component does not work due to how web components works.
  Changed: The types for define template functions are clear

## 2.3.0

### Minor Changes

- Added Define template.
- Changed projector templateId is no longer the only argument that you can pass.
- Added context to the template It's a set of arguments that are passed

## 2.2.4

### Patch Changes

- Fixed: Peer dependency is now greater than 1.0.0 instead of just ^1.0.0

## 2.2.3

### Patch Changes

- iterate function makes sure that the key that is passed is a number when an array is passed.
- The hide component works as intended

## 2.2.2

### Patch Changes

- Changed arguments for the iterate function and its internal logic.
- The `<For/>` component has changed as well.

## 2.2.1

### Patch Changes

- I have made it so that the Gap component and the PageLink work properly.

## 2.2.0

### Minor Changes

- Added two functions executeIf and executeUnless.
  Both take in a condition and a function.
  `executeIf()` will call the function only when the condition is true
  `executeUnless()` will call the function only when the condition is false

## 2.1.0

### Minor Changes

- I have a new component called IslandsMirror  data-attribute of data-islands-key

  - First have it's attributes grabbed
  - The attributes will be set on the parent
  - The children of that element will be taken from it.
  - The parent will inherit those children

  I have also changed the strategy for range.

  Range works like a normal one

  - It will add when start is less stop and the number is positive
  - It will do the opposite when start and stop's roles are reversed and the number is negative.

## 1.0.3

### Patch Changes

- Fixed the files folder for both.

## 1.0.2

### Patch Changes

- Changed where the main file is from src/index to just index types should be from the main package

## 1.0.1

### Patch Changes

- I added a ReadME file that contains all you need to know about @forastro/utilities

## 1.0.0

### Major Changes

- This package is ready for the masses and has all the components necessary for production

  To update please install pnpm up @forastro/utilities --latest

- This is the first version of this package.
  All of the necessary utlitities are created.

  - Created range, iterateRange, iterate, helpers
  - Created the Gap Component and Projector Component
  - Created all necessary types for authors to consume
