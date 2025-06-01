const replaceValuesInExportsPlugin = require('../../plugins/replaceValuesInExportsPlugin.cts');

module.exports = {
  plugins: [replaceValuesInExportsPlugin('./src', '', ['./components'])],
};
