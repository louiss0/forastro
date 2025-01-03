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