const path = require("node:path");
const fs = require("node:fs");


module.exports = (
    replacements = [
        { target: /^src\//, replacement: "" },
        { target: /\.ts$/, replacement: ".js" }
    ],
    ignoreProps = ['']
) => {



    const replaceStringOrTheStringValuesOfAnObjectUsingReplacements =
        (
            targetAndReplacements,
            data
        ) => {

            if (typeof data === 'string') {

                return targetAndReplacements.reduce(
                    (accumulator, { replacement, target }) =>
                        accumulator.replace(target, replacement),
                    data
                )

            }

            return Object.fromEntries(
                Object.entries(data).map(([key, value]) =>
                    [key,
                        targetAndReplacements.reduce(
                            (accumulator, { target, replacement }) =>
                                accumulator.replace(target, replacement),
                            value
                        )
                    ]
                ))

        }


    return {
        name: "replace-ts-with-js-in-package-json",
        setup(build) {

            build.onEnd(() => {

                const outFolder = build.initialOptions.outfile
                    .match(/^([\w/]+\/)/)?.[0];


                let packageJsonPath;

                if (__dirname === outFolder) {

                    packageJsonPath = path.resolve(__dirname, "package.json");

                }

                packageJsonPath =
                    path.resolve(__dirname, outFolder, 'package.json');


                if (!fs.existsSync(packageJsonPath)) {

                    throw Error(
                        `This file isn't in here ${outFolder}`,
                        {
                            cause: "Invalid Path"
                        }
                    );

                }

                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

                const packageJSONObjectWithExportEntryValuesAndNestedValuesReplacedUsingReplacements =
                    Object.fromEntries(
                        Object.entries(pkg).map(([key, value]) => {

                            if (key === 'exports') {

                                if (typeof value === "object" && value !== null) {

                                    return [
                                        key,
                                        Object.fromEntries(
                                            Object.entries(value).map(
                                                ([key, value]) => {


                                                    if (ignoreProps.includes(key)) {
                                                        return [key, value]
                                                    }

                                                    return [
                                                        key,
                                                        replaceStringOrTheStringValuesOfAnObjectUsingReplacements(
                                                            replacements,
                                                            value
                                                        )
                                                    ];

                                                }


                                            )
                                        )
                                    ];
                                }


                            }

                            return [key, value];


                        })
                    );


                fs.writeFileSync(
                    packageJsonPath,
                    JSON.stringify(
                        packageJSONObjectWithExportEntryValuesAndNestedValuesReplacedUsingReplacements,
                        null,
                        2)
                );
            });
        },
    };
}
