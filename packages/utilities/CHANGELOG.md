# @forastro/utilities

## [Unreleased]

### Changed

- `<Gap/>` doesn't use pixels or the parent font size style to calculate gap distance it uses em.
- `useDefineTemplateAndProjector` is changed to `useTemplaterAndProjector`
  
### Fixed

- All get Collection helpers rely on type alias instead of derived types.

## [4.0.1] - 2023-10-12

### Fixed

- Types are now exported in the index
- Gap can now work with parents that have a display
  - block
  - inline
  - inline-grid
  - inline-flex
  - flow-root

## [4.0.0] - 2023-10-10

### Added

- Bundling with `"tsup"`

### Fixed

- Removed circular imports from helpers files.

## [3.2.0] - 2023-10-06

## Added

- A set of functions that help get rid of the hassle of `getCollections()`
  - `getCollectionDataList`
  - `getEntryData`
  - `getDataListFromEntries`
  - `getCollectionPaths`

## [3.1.2] - 2023-10-02

### Fixed

- Add a homepage to the package.json file that links to the homepage for this project.

### Fixed

- Add a homepage to the package.json file that links to the homepage for this project.

## [3.1.1] - 2023-10-02

### Added

- Function for markdoc that instantly creates markdoc transform objects.

### Fixed

- Throw functions were created but not available now they are.

## [3.1.0]

### Added

- Utility functions for throwing errors
- A new function for if and else conditions
- A new function that returns the result of a promise and an error.

## [3.0.2] - 2023-08-31

### Fixed

The default slot will not error if it's not passed without the expectation
of it and the define template context.

### Added

Created a new type called slot function to represent a slot in astro.

## [3.0.1] 2023-08-29

### Fixed

- Made sure that the types account for all allowed scenarios for `DefineTemplate` and `Projector`.

### Added

- Error messages will now be thrown when using not sending the right data
to `DefineTemplate` and `Projector`.

- The `useDefineTemplateAndProjector()`
  - now allows the user to pass in a debug name.
  - It will also keep track of every time it's called.
  - Each call number will be associated with the name of ``DefineTemplate` and `Projector`
  for an error message.

## [3.0.0] - 2023-08-27

### Added

- A new function was created called `useDefineTemplateAndProjector`.
  - It generates two components in a tuple on the left `DefineTemplate` right `Projector`
  - It also accepts types for send information from define template projector and back.

### Removed

- DefineTemplate and Projector components are now removed.

## [2.7.1] - 2023-08-17

### Fixed

- Fixed types in the pkg.json file **Astro will not recognise the types if you do**

## [2.7.0]

### Fixed

- Removed tsup from repo and files are no longer bundled.

### Changed

- Range is now a function that uses an option param as third param.
  - It's a object that allows you to pass in a step or inclusive.
  - Negative numbers are not allowed to be used.

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

## [0.0.0]

Unreleased version release.
