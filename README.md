# @forastro Monorepo

This repo is the repo for all of the packages that I will create for astro.
The name of this monorepo is called `@forastro/monorepo`.
This monorepo uses `nx` as it's monorepo manager.
This kind of monorepo is called a _integrated monorepo_.
Which means that all of the packages are installed in the root directory.
There are two main folders for this monorepo. `demo` `packages`.
The demo folder is for testing and demonstrating the power of each package.
The packages folder is for all of my packages. It's the one where all of my packages are created.

## Usage

To use this repo you need to know how `nx` works.
The point of this library is to create packages then test them out so what you want to do is start the server.
To do that use `nx run demo:dev`.

### Tooling

| Type       | Tool         |
| ---------- | ------------ |
| testing    | vitest       |
| changelogs | changesets   |
| styling    | tailwind css |
| linter     | eslint       |
| formatter  | prettier     |

## Repositories

This section is about giving you an overview of all of the packages that I have created for this mono-repo.
Each title is the name of a folder that exists in this monorepo.
I don't know how to do **end-to-end testing** and it's not necessary so I will use the pages in demo as a testing ground.
I will do basic testing for individual packages in each folder for the packages

### Demo

The demo is the place where all of the packages are tested and where what they can do is shown.
It uses Taliwind CSS for styling.

### Flow

Flow is a package that is created to emulate control flow inside of components.
the package is called `@forastro/flow`. It has a folder called the components folder and a file called helpers.
Helpers are a set of functions that are designed to help the flow components work.
The components file is where all of the components are. All of them are exported in a index.ts file.

### Utilities

Utilities is a package that is created to emulate control flow inside of components.
the package is called `@forastro/utilities`. It has a folder called the components folder and a file called helpers.
Helpers are a set of functions that are designed to help the flow components work.
The components file is where all of the components are.
All of them are exported in a index.ts file.

## Templates

The templates that exist in this Mono repo are.

- [Astro Minimal](/docs/templates/astro-minimal.md)
- [Astro Vue](/docs/templates/astro-vue.md)
- [Astro Preact](/docs/templates/astro-preact.md)
- [Astro Mdx](/docs/templates/astro-mdx.md)
