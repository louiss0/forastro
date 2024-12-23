import {
  transformerVariantGroup,
  defineConfig,
  presetUno,
  presetTypography,
  presetWind
} from 'unocss';

import { presetAdocTypograhy } from "@forastro/asciidoc/unocss"

// I won't use preset icons again. It's hard to size icons.
export default defineConfig({
  presets: [
    // Use WindiCSS classes.
    presetWind(),
    // presetTypography(),
    presetAdocTypograhy(),
  ],
  transformers: [
    // Enable variant groups.
    transformerVariantGroup(),
  ],
  blocklist: [
    // Remove all variations of ma, ba, pa, variations
    /^(?:(?:m|p|b)a-)/,
    // Remove all op|of|position|case|decoration|line-height|b|c classes.
    // They aren't a part of tailwind.
    /^(?:(?:op|of|position|case|decoration|line-height|b|c)-)/,
    // Remove all bg|text|border|outline classes with words and dash anything after.
    // They aren't a part of tailwind.
    /^(?:bg|text|border|outline)-(?:[a-z]+[A-Z][a-z]+)/,
    /^(?:bg|text|border|outline)-(?:[a-z]+)-[1-9]$/,
    // Remove all object- classes that have only one letter.
    // They aren't a part of tailwind.
    /^(?:object)-[a-z]{2}$/,
    // Remove all grid- classes that aren't grid-cols.
    // They aren't a part of tailwind.
    /^(grid)-(?!cols)/,
    // Remove all flex- classes that aren't flex-col.
    // They aren't a part of tailwind.
    /^(flex)-(?!col)/,
    // Remove all font|rounded- classes that have numbers.
    // They aren't a part of tailwind.
    /^(font|rounded)-\d+/,
  ],
});
