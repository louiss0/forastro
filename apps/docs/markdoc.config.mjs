import { defineMarkdocConfig } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';

const { nodes, tags } = starlightMarkdoc();

export default defineMarkdocConfig({
  nodes,
  tags,
  extends: [],
});
