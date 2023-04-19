# Astro minimal template

This template is my astro template for simple web pages.

It does not use a framework at all it will try to only use lit. If necessary. It uses tailwind as it's CSS Framework. It uses astro image tools for images.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

| Folder     | Files                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------- |
| pages      | index                                                                                               |
| utilities  | types, constants helpers                                                                            |
| components | Image, Typography, List, Section, SpacedBox, Border, ButtonControl, Navbar, Head, Center, Container |
| layouts    | Default, HMF                                                                                        |

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                             |
| :--------------------- | :------------------------------------------------- |
| `npm install`          | Installs dependencies                              |
| `npm run dev`          | Starts local dev server at `localhost:3000`        |
| `npm run build`        | Build your production site to `./dist/`            |
| `npm run preview`      | Preview your build locally, before deploying       |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `npm run astro --help` | Get help using the Astro CLI                       |
