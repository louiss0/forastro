import { definePreset, type Preset } from "unocss";
import type { Theme } from "unocss/preset-mini";

export default definePreset(() => {

    const SELECTOR = "prose"
    const selectorRE = new RegExp(`^${SELECTOR}$`)

    const selectorColorRE = new RegExp(`${SELECTOR}-([a-z-]+)`)

    return {
        name: "forastro/asciidoc:typography",
        enforce: "post",
        layer: "typography",
        rules: [
            [selectorRE,
                (_, { rawSelector }) => {


                    return {
                        foo: ""
                    }

                }
            ],
            [
                selectorColorRE,
                ([, color], { theme }) => {

                    if (!color) return

                    const colorObject = theme.colors?.[color]

                    if (!colorObject || typeof colorObject === "string") {
                        return
                    }


                    return {
                        "--faa-prose-color-50": colorObject[50] as string,
                        "--faa-prose-color-100": colorObject[100] as string,
                        "--faa-prose-color-200": colorObject[200] as string,
                        "--faa-prose-color-300": colorObject[300] as string,
                        "--faa-prose-color-400": colorObject[400] as string,
                        "--faa-prose-color-500": colorObject[500] as string,
                        "--faa-prose-color-600": colorObject[600] as string,
                        "--faa-prose-color-700": colorObject[700] as string,
                        "--faa-prose-color-800": colorObject[800] as string,
                        "--faa-prose-color-900": colorObject[900] as string,
                        // Inverted colors
                        "--faa-prose-color-invert-50": colorObject[900] as string,
                        "--faa-prose-color-invert-100": colorObject[800] as string,
                        "--faa-prose-color-invert-200": colorObject[700] as string,
                        "--faa-prose-color-invert-300": colorObject[600] as string,
                        "--faa-prose-color-invert-400": colorObject[500] as string,
                        "--faa-prose-color-invert-500": colorObject[400] as string,
                        "--faa-prose-color-invert-600": colorObject[300] as string,
                        "--faa-prose-color-invert-700": colorObject[200] as string,
                        "--faa-prose-color-invert-800": colorObject[100] as string,
                        "--faa-prose-color-invert-900": colorObject[50] as string,

                    }

                }
            ]
        ]


    } satisfies Preset<Theme>

})