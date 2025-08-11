import * as unocss from 'unocss';
import { Theme } from 'unocss/preset-mini';

declare const presetAsciidocTypography: unocss.PresetFactory<Theme, undefined>;
declare function getCSSWithSelectorName(typographySelectorName: string): () => string;

export { getCSSWithSelectorName, presetAsciidocTypography };
