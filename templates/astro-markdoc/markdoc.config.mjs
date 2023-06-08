import { abbrSchema,  } from '@forastro/markdoc-html-tags';

import { defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
    nodes: {
        document: {
            ...nodes.document, 
            render:null,
        },
    },
    tags:{
        abbr: abbrSchema
    }
})