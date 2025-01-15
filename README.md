# For Astro Monorepo

This monorepo is a repo that is dedicated creating projects under the `@forastro/` scope.
All project's under this repo are made to make using Astro easier.
This repo releases projects by using Nx release.
Even though this repo is a pnpm repo this repo is now package based.
Because too most Astro packages rely on being in the root.

The packages that have been released so far under this repo are.

- `@forastro/flow`
- `@forastro/remark-html-directives`
- `@forastro/utilities`
- `@forastro/asciidoc`

: Tools :

| type            | name     |
| --------------- | -------- |
| monorepo manger | Nx       |
| test runner     | vitest   |
| bundler         | esbuild  |
| linter          | eslint   |
| formatter       | prettier |

## Packages

All packages that are meant to be released under this repo are in the `pacakages/` folder.
I have decided to get rid of `@forastro/flow` and `@forastro/remark-html-directives`.
I won't maintain them anymore and they got in the way of integrating to Nx Release.
If I do release new packages I plan on using a tag system to decide which packages
should be built. The tag `lib:ongoing` will be used to tell which project's will be maintained. The tag `lib:paused` means no more releases.

When it comes to packages I use Nx Release's Conventional Commits to decide how they should be released.

To release a package all you need to do is use `pnpm exec nx release`.
If thing's don't work out then use.

1. `nx release changelog`
2. `nx release version`
3. `nx release publish`

I created an `esbuild.config.cts` file it's there to make sure all `.ts` files are changed into `.js`. files. This makes it so that deployment is simple. Don't touch it!
Every project created from now until NX ESbuild does this for you.
Should have this in the `project.json` file.

```json
{
    "targets": {
    "build": {
      "options": {
        "esbuildConfig": "esbuild.config.cts"
      }
    }
  }
}
```

### Utilities

This package is a set of tools that are created specifically to use with Astro.
They are created to allow you make using and writing Astro Components easier.
Some utilities are created to help with other tasks.

There are two main folders in the `src/` folders:

- `components/` The folder where all components are stored.
- `lib/` The folder where functions are stored.

The components folder must remain separate from the lib folder so that there
is no bundling. All components are exported through an `index.ts` file.

There are a few files in the lib folder but the most important one is the `useTemplaterAndProjector` `.dts` and `.js` files.
They were created because the logic in the js file can't be used to express the types that the user need's.
Those files must remain separate.

### Asciidoc

This package is created so that that people can use Asciidoc with Astro.
It's hold's the `asciidocLoader` which is the function that is used to load and extract data and content from Asciidoc files.
It also allows the user to use a few highlighter's from the JS ecosystem.
It also has files that are created specifically to integrate with UnoCSS and Tailwind.

It's a repo with the following files:

- `unocss.ts` A file created to export a UnoCSS preset for Styling Asciidoc files.
- `tailwind.ts` A file created to export a TailwindCSS plugin for Styling Asciidoc files.
- `asciidoc.ts` A file created to hold the `asciidocLoader`.
- `internal.ts` A file created to hold all functionality that the user isn't supposed to know about.

It's important to know that the unocss and the tailwind files are separate.
Because they can't be used otherwise.
Each file's name is used as a key in the `exports:` field in the `package.json` file.
With the link to the file being used as the value of the file.

## Apps

The apps in this repo are stored in the `apps/` folder.
The apps here exist as apps that are created to support Astro.
An app exists in this repo if it's a way to support Astro or this repo.

### Astro Circle

*Astro Circle* is an  app that was created for people to download images of the Astro Logo covered by a circle.
The images in the app all use logo's for other front-end framework's.

### Docs

The docs app is the docs for the For Astro monorepo's packages and templates.
It's there so that people can learn about the packages that are created using the `@forastro/` scope.
The docs site is an **Astro Starlight based site that uses Markdoc to render Starlight components**.

All information related to packages is stored in the `libraries/` folder.
Each `index.mdoc` file is used to introduce the library and has the version written in the front matter.
The title prop always contains the name of the package capitalized.

All information about templates is stored in the `templates/` folder.

Each template file is supposed to contain the following information:

- How to create an app using the template.
- What dependencies it relies on other than Astro.
- What config files exist and how the files are configured.

## Templates

The templates that exist in this Mono repo are.

- [Astro Minimal](/docs/templates/astro-minimal.md)
- [Astro Preact](/docs/templates/astro-preact.md)
- [Astro Mdx](/docs/templates/astro-mdx.md)
