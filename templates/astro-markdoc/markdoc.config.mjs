import { abbrSchema } from '@forastro/markdoc-html-tags';

import { defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
    tags:{
        abbr: abbrSchema
    }
})