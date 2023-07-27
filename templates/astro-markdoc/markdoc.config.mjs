import {
  markdocHTMLTagSchemas
} from 'markdoc-html-tag-schemas';

import { defineMarkdocConfig,  } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  extends: [
    markdocHTMLTagSchemas()
  ]
});
