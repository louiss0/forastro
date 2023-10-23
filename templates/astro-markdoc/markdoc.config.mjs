import {
  markdocHTMLTagSchemas
} from 'markdoc-html-tag-schemas';
import { defineMarkdocConfig, } from '@astrojs/markdoc/config';

const { tags, nodes } = markdocHTMLTagSchemas()

export default defineMarkdocConfig({
  tags: {
    ...tags
  },
  nodes: {
    ...nodes
  }
});
