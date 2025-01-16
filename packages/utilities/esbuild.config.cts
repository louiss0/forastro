
const replaceValuesInExportsPlugin = require("../../replaceValuesInExportsPlugin.cts")

module.exports = {
    plugins: [
        replaceValuesInExportsPlugin(
            [
                { target: /src\//, replacement: "" },
                { target: /\.ts$/, replacement: ".js" }
            ],
            ['./components']
        )
    ]
}

