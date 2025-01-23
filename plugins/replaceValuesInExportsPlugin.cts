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


                const { outdir, outfile } = build.initialOptions


                const outputDirectoryFromRoot = outdir ?? outfile.match(/^([a-z/]+\/).+/)[1]


                if (!outputDirectoryFromRoot) {


                    throw Error(
                        "There is no output Directory make sure that esbuild has a outfile or a outdir property",
                        { cause: "No Directory Path" }
                    )
                }

                let packageJsonPath;

                const currentWorkingDirectory = process.cwd()

                if (currentWorkingDirectory === outputDirectoryFromRoot) {

                    packageJsonPath = path.resolve(currentWorkingDirectory, "package.json");

                } else {

                    packageJsonPath =
                        path.resolve(currentWorkingDirectory, outputDirectoryFromRoot, 'package.json');
                }


                if (!fs.existsSync(packageJsonPath)) {

                    throw Error(
                        `This file isn't in here ${outputDirectoryFromRoot}`,
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
