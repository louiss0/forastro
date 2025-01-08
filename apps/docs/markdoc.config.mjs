import { defineMarkdocConfig } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';

const extension = starlightMarkdoc();

export default defineMarkdocConfig({
  ...extension,
  extends: [],
});
