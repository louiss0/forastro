import { presetWind, presetIcons, defineConfig } from 'unocss';


export default defineConfig({
    presets: [
        presetWind(),
        presetIcons(),
    ],
    blocklist: [
        /^(?:(?:m|p|b)a-)/,
        /^(?:(?:op|of|position|case|decoration|line-height|b|c)-)/,
        /^(?:bg|text|border|outline)-(?:[a-z]+[A-Z][a-z]+)/,
        /^(?:bg|text|border|outline)-(?:[a-z]+)-[1-9]$/,
        /^(?:object)-[a-z]{2}$/,
        /^(grid)-(?!cols)/,
        /^(flex)-(?!col|wrap)/,
        /^(font|rounded)-\d+/
    ],
})