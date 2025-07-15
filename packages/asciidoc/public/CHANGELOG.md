## 2.3.2 (2025-07-15)

### 🩹 Fixes

- Add types export The types need to be where the export's are for paths to be acknowledged! ([68ec6b9](https://github.com/louiss0/forastro/commit/68ec6b9))

### ❤️ Thank You

- Shelton Louis @louiss0

## 2.3.1 (2025-07-15)

### 🩹 Fixes

- change code according to eslint errors ([5dbc23a](https://github.com/louiss0/forastro/commit/5dbc23a))
- change attribute key transformation to handle snake case ([e656982](https://github.com/louiss0/forastro/commit/e656982))
- change match index to capture change correctly I decided to use the right index to capture the file name according to the regex. There is no two anymore! ([959619d](https://github.com/louiss0/forastro/commit/959619d))
- Update hero image path and description ([fd71b8c](https://github.com/louiss0/forastro/commit/fd71b8c))
- author regex and schema ([4381286](https://github.com/louiss0/forastro/commit/4381286))
- change methods used to create zod function I ran into a bug where I found out that the tuple syntax doesn't allow return types to be Promises! ([dc42d5d](https://github.com/louiss0/forastro/commit/dc42d5d))
- Use pathe package for path resolution I found a bug related to `node:os` being a `.cjs` library! It's used by `node:path` so it needed to go! ([afa1ccb](https://github.com/louiss0/forastro/commit/afa1ccb))

### ❤️ Thank You

- Shelton Louis @louiss0

## 2.3.0 (2025-06-01)

This was a version bump only for asciidoc to align it with other projects, there were no code changes.

## 2.2.1 (2025-01-23)

### 🩹 Fixes

- **asciidoc:** add optional dependencies to the package.json file  Not having a optional dependencies was never intended.  This only happened because I placed the information in the wrong package file. ([8741ebd](https://github.com/louiss0/forastro/commit/8741ebd))

### ❤️ Thank You

- louiss0 @louiss0

## 2.2.0 (2025-01-23)

### 🚀 Features

- **forastro:** Add ESbuild plugin to transform ts extension into js ones I'm doing this because I realized that people should rely on nu shell to transform files. Tt should be a part of the system. Doing this ensures ease of use ([40c116f](https://github.com/louiss0/forastro/commit/40c116f))

### 🩹 Fixes

- **forastro:** make changes to files based on ts and eslint errors I found many eslint and ts based errors in these files But for the tailwind file I needed to place an object as the lat argument. So I took out the prose object and spread it out ([0002778](https://github.com/louiss0/forastro/commit/0002778))
- add unocss and tailwindcss as devDependencies for building ([7eab921](https://github.com/louiss0/forastro/commit/7eab921))
- **forastro:** fix paths to esbuild file in the projects config for utilities and asciidoc ([6b2183e](https://github.com/louiss0/forastro/commit/6b2183e))
- remove used localdate variable ([b0f764e](https://github.com/louiss0/forastro/commit/b0f764e))
- **asciidoc:** allow array values to be parsed when attribute values are being validated\n I tried to use the mock app to test the chages so far.\nBut discovered that prism languages weren't being processed properly\nit was because it returns an array ([c421e5a](https://github.com/louiss0/forastro/commit/c421e5a))
- use proper document type ([f73f5a6](https://github.com/louiss0/forastro/commit/f73f5a6))

### ❤️ Thank You

- louiss0 @louiss0

## 2.1.1 (2025-01-13)

### 🩹 Fixes

- **asciidoc:** allow array values to be parsed when attribute values are being validated\n I tried to use the mock app to test the chages so far.\nBut discovered that prism languages weren't being processed properly\nit was because it returns an array ([3eb988e](https://github.com/louiss0/forastro/commit/3eb988e))
- use proper document type ([b209c27](https://github.com/louiss0/forastro/commit/b209c27))

### ❤️ Thank You

- louiss0 @louiss0

## 2.1.0 (2025-01-05)

### 🚀 Features

- add attribute validation based on snake or dash case keys ([62edfde](https://github.com/louiss0/forastro/commit/62edfde))
- add content folder name validation ([c76d601](https://github.com/louiss0/forastro/commit/c76d601))

### 🩹 Fixes

- enforce dashed case validation and transform into camelCase before validation ([fe229d4](https://github.com/louiss0/forastro/commit/fe229d4))
- remove last group from regex's related to case schemas ([66a998a](https://github.com/louiss0/forastro/commit/66a998a))
- fetch files from the folder with the collection's name in it The loader would previously fetch all content from the folder regardless of collection Now it uses the collection name to determine the exact folder to get content from ([c153935](https://github.com/louiss0/forastro/commit/c153935))
- split plugin file into two different files I ran into a bug where the tailwind plugin was supposed to be loaded but it couldn't due to the fact that it wasn't downloaded. If the user uses the tailwind plugin then they should only use the tailwind file The test file only tested the unocss logic so it's now changed to unocss.spec ([d73ed13](https://github.com/louiss0/forastro/commit/d73ed13))

### ❤️ Thank You

- louiss0 @louiss0

# 3.0.0 (2025-01-03)

This was a version bump only for asciidoc to align it with other projects, there were no code changes.

# 2.0.0 (2025-01-03)

This was a version bump only for asciidoc to align it with other projects, there were no code changes.

# 1.0.0 (2025-01-03)

### 🚀 Features

- add 'tailwindcss' as an optional dependency ([fa8d477](https://github.com/louiss0/forastro/commit/fa8d477))
- add sizes selectors for tailwind plugin ([20fe290](https://github.com/louiss0/forastro/commit/20fe290))
- add static color support to tailwind plugin ([eb7c56a](https://github.com/louiss0/forastro/commit/eb7c56a))
- create tailwind plugin ([591355c](https://github.com/louiss0/forastro/commit/591355c))
- add support for prism-highlighter remove highlight I decided that highlightjs would get in the way of how this library is used Now only prism and shiki are supported. ([7a7a055](https://github.com/louiss0/forastro/commit/7a7a055))
- integrate shiki into asciidoctor This feature includes two things. Validation for shiki. Registration of shiki themes based on configuration. All langauges are loadeed there are no restrictions ([08cdcbb](https://github.com/louiss0/forastro/commit/08cdcbb))

### 🩹 Fixes

- make shiki the default highlighter ([bcb5b8e](https://github.com/louiss0/forastro/commit/bcb5b8e))
- make shiki highlighter work by setting the handlesHighlighting option to true ([9656cd2](https://github.com/louiss0/forastro/commit/9656cd2))
- register blocks and macros globally Creating an extension didn't work for some reason. I don't know why but it just didn't. I used the asciidoc-loader-mock project to test this out ([8b0b884](https://github.com/louiss0/forastro/commit/8b0b884))
- when creating documents load paths using the content folder path ([1bf368c](https://github.com/louiss0/forastro/commit/1bf368c))
- make a default theme is passed for highlightjs so if unspecified the user can simply omit it as well ([d7a2038](https://github.com/louiss0/forastro/commit/d7a2038))
- remove config folder  argument from asciidoc loader ([ded5558](https://github.com/louiss0/forastro/commit/ded5558))
- replace Asciidoctor type with one from the asciidoctor's return type Typescript doesn't process types from asciidoc I forgot ([7b30972](https://github.com/louiss0/forastro/commit/7b30972))
- use dash case to access object's instead of camelCase  I made zod turn all attributes into lower dashed case when attributes are being parsed ([11bd491](https://github.com/louiss0/forastro/commit/11bd491))
- remove highlighter options and only use only highlight'js with proper options ([a0311ba](https://github.com/louiss0/forastro/commit/a0311ba))

### ❤️ Thank You

- louiss0 @louiss0

## 0.3.0 (2025-01-02)

### 🚀 Features

- add 'tailwindcss' as an optional dependency ([fa8d477](https://github.com/louiss0/forastro/commit/fa8d477))
- add sizes selectors for tailwind plugin ([20fe290](https://github.com/louiss0/forastro/commit/20fe290))
- add static color support to tailwind plugin ([eb7c56a](https://github.com/louiss0/forastro/commit/eb7c56a))
- create tailwind plugin ([591355c](https://github.com/louiss0/forastro/commit/591355c))
- add support for prism-highlighter remove highlight I decided that highlightjs would get in the way of how this library is used Now only prism and shiki are supported. ([7a7a055](https://github.com/louiss0/forastro/commit/7a7a055))
- integrate shiki into asciidoctor This feature includes two things. Validation for shiki. Registration of shiki themes based on configuration. All langauges are loadeed there are no restrictions ([08cdcbb](https://github.com/louiss0/forastro/commit/08cdcbb))

### 🩹 Fixes

- make shiki the default highlighter ([bcb5b8e](https://github.com/louiss0/forastro/commit/bcb5b8e))
- make shiki highlighter work by setting the handlesHighlighting option to true ([9656cd2](https://github.com/louiss0/forastro/commit/9656cd2))
- register blocks and macros globally Creating an extension didn't work for some reason. I don't know why but it just didn't. I used the asciidoc-loader-mock project to test this out ([8b0b884](https://github.com/louiss0/forastro/commit/8b0b884))
- when creating documents load paths using the content folder path ([1bf368c](https://github.com/louiss0/forastro/commit/1bf368c))
- make a default theme is passed for highlightjs so if unspecified the user can simply omit it as well ([d7a2038](https://github.com/louiss0/forastro/commit/d7a2038))
- remove config folder  argument from asciidoc loader ([ded5558](https://github.com/louiss0/forastro/commit/ded5558))
- replace Asciidoctor type with one from the asciidoctor's return type Typescript doesn't process types from asciidoc I forgot ([7b30972](https://github.com/louiss0/forastro/commit/7b30972))
- use dash case to access object's instead of camelCase  I made zod turn all attributes into lower dashed case when attributes are being parsed ([11bd491](https://github.com/louiss0/forastro/commit/11bd491))
- remove highlighter options and only use only highlight'js with proper options ([a0311ba](https://github.com/louiss0/forastro/commit/a0311ba))

### ❤️ Thank You

- louiss0 @louiss0