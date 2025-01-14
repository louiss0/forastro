// const esbuild = require("esbuild");
const path = require("node:path");
const fs = require("node:fs");


module.exports = {
    plugins: [
        {
            name: "replace-ts-with-js-in-package-json",
            setup(build) {

                build.onEnd(() => {

                    const outFolder = build.initialOptions.outfile
                        .match(/^([\w/]+\/)/)?.[0]

                    let packageJsonPath

                    if (__dirname === outFolder) {

                        packageJsonPath = path.resolve(__dirname, "package.json")

                    }
                    packageJsonPath =
                        path.resolve(__dirname, outFolder, 'package.json');


                    if (!fs.existsSync(packageJsonPath)) {

                        throw Error(
                            `This file isn't in here ${outFolder}`,
                            {
                                cause: "Invalid Path"
                            }
                        )

                    }

                    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

                    const packageJSONObjectWithTsReplacedWithJS =
                        Object.fromEntries(
                            Object.entries(pkg).map(([key, value]) => {

                                if (key === 'exports') {

                                    if (typeof value === "object" && value !== null) {

                                        const replaceDotTSWithDotJSInValuesOrEntryValues =
                                            (data) =>
                                                typeof data === "string"
                                                    ? data.replace(/\.ts$/, ".js")
                                                    : Object.fromEntries(
                                                        Object.entries(data)
                                                            .map(
                                                                ([key, value]) =>
                                                                    [
                                                                        key,
                                                                        typeof value === "string"
                                                                            ? value.replace(
                                                                                /\.ts$/,
                                                                                ".js")
                                                                            : value
                                                                    ]
                                                            )
                                                    )


                                        return [
                                            key,
                                            Object.fromEntries(
                                                Object.entries(value).map(
                                                    ([key, value]) =>
                                                        [
                                                            key,
                                                            replaceDotTSWithDotJSInValuesOrEntryValues(value)
                                                        ]


                                                )
                                            )
                                        ]
                                    }


                                }

                                return [key, value]


                            })
                        )

                    fs.writeFileSync(
                        packageJsonPath,
                        JSON.stringify(packageJSONObjectWithTsReplacedWithJS, null, 2)
                    );
                });
            },
        }
    ]
} 