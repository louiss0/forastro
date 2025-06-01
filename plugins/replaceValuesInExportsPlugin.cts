const path = require('node:path');
const fs = require('node:fs');

module.exports = (oldFolder = '', newFolder = 'src', ignoreProps = ['']) => {
  return {
    name: 'replace-ts-with-js-in-package-json',
    setup(build) {
      build.onEnd(() => {
        const { outdir, outfile } = build.initialOptions;

        const outputDirectoryFromRoot =
          outdir ?? outfile.match(/^([a-z/]+\/).+/)[1];

        if (!outputDirectoryFromRoot) {
          throw Error(
            'There is no output Directory make sure that esbuild has a outfile or a outdir property',
            { cause: 'No Directory Path' },
          );
        }

        let packageJsonPath;

        const currentWorkingDirectory = process.cwd();

        if (currentWorkingDirectory === outputDirectoryFromRoot) {
          packageJsonPath = path.resolve(
            currentWorkingDirectory,
            'package.json',
          );
        } else {
          packageJsonPath = path.resolve(
            currentWorkingDirectory,
            outputDirectoryFromRoot,
            'package.json',
          );
        }

        const ignorePropThatDoesNotStartWithDotSlash = ignoreProps.find(
          (ignoreProp) => !ignoreProp.startsWith('./'),
        );

        if (ignorePropThatDoesNotStartWithDotSlash) {
          throw Error(
            `$This ignore prop ${ignorePropThatDoesNotStartWithDotSlash} does not start with ./
            Please add a ./ to the start of the ignore prop or remove it`,
            { cause: 'Invalid list of ignore props' },
          );
        }

        processPackageJson(
          packageJsonPath,
          outputDirectoryFromRoot,
          oldFolder,
          newFolder,
          ignoreProps,
        );
      });
    },
  };
};

/**
 * Replaces .ts extension with .js in a string.
 * @param {string} value
 * @returns {string}
 */
function replaceTsWithJs(value) {
  return value.replace(/\.ts$/, '.js');
}

/**
 * Replaces the old folder path with the new folder in a string path.
 * @param {string} value - The path string.
 * @param {string} oldFolder - The folder to replace.
 * @param {string} newFolder - The folder to replace with.
 * @returns {string}
 */
function replaceFolderPath(value, oldFolder, newFolder) {
  if (typeof value !== 'string') return value;

  if (value.startsWith(oldFolder)) {
    return value.replace(oldFolder, newFolder);
  }
  return value;
}

/**
 * Processes an individual export entry, which can be a string or an object.
 * @param {string|Object} entry
 * @param {string} oldFolder
 * @param {string} newFolder
 * @returns {string|Object}
 */
function processExportEntry(entry, oldFolder, newFolder) {
  if (typeof entry === 'string') {
    // Replace folder path and extension
    let replacedPath = replaceFolderPath(entry, oldFolder, newFolder);
    replacedPath = replaceTsWithJs(replacedPath);
    return replacedPath;
  } else if (typeof entry === 'object' && entry !== null) {
    const newEntry = { ...entry };
    if ('require' in newEntry && typeof newEntry.require === 'string') {
      newEntry.require = replaceFolderPath(
        newEntry.require,
        oldFolder,
        newFolder,
      );
      newEntry.require = replaceTsWithJs(newEntry.require);
    }
    if ('import' in newEntry && typeof newEntry.import === 'string') {
      newEntry.import = replaceFolderPath(
        newEntry.import,
        oldFolder,
        newFolder,
      );
      newEntry.import = replaceTsWithJs(newEntry.import);
    }
    return newEntry;
  }
  return entry;
}

/**
 * Processes the exports object, transforming all entries.
 * @param {Object} exportsObj
 * @param {string} oldFolder
 * @param {string} newFolder
 * @param {Set<string>} ignoreKeys
 * @returns {Object}
 */
function processExports(exportsObj, oldFolder, newFolder, ignoreKeys) {
  const newExports = {};
  for (const [key, value] of Object.entries(exportsObj)) {
    if (ignoreKeys.has(key)) {
      newExports[key] = value; // skip processing
    } else {
      newExports[key] = processExportEntry(value, oldFolder, newFolder);
    }
  }
  return newExports;
}

/**
 * Processes the `package.json` file by transforming export paths from TypeScript (.ts)
 * to JavaScript (.js) and optionally replacing folder paths. It writes the modified
 * `package.json` to the output directory after bundling.
 *
 * @param {string} inputPath - Absolute or relative path to the original `package.json` file.
 * @param {string} outputDir - Path to the directory where the transformed `package.json` should be written.
 * @param {string} oldFolder - Folder path prefix to be replaced (e.g. `src`).
 * @param {string} newFolder - New folder path prefix to replace with (e.g. `dist`).
 * @param {Array<string>} ignoreKeys - A list of keys in the exports map to ignore during transformation.
 */
function processPackageJson(
  inputPath,
  outputDir,
  oldFolder,
  newFolder,
  ignoreKeys,
) {
  // Resolve the absolute path to the input package.json
  const packageJsonPath = path.resolve(inputPath);

  // Read and parse the package.json contents
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Create a shallow copy to avoid mutating the original object
  const newPackageData = { ...packageData };
  const ignoreSet = new Set(ignoreKeys);

  // Transform the "exports" field if it exists
  if (newPackageData.exports) {
    newPackageData.exports = processExports(
      newPackageData.exports,
      oldFolder,
      newFolder,
      ignoreSet,
    );
  }

  // Build the final output path for the modified package.json
  const outputPath = path.join(path.resolve(outputDir), 'package.json');

  // Ensure that the output directory exists
  fs.mkdirSync(path.resolve(outputDir), { recursive: true });

  // Write the modified package.json to disk
  fs.writeFileSync(
    outputPath,
    JSON.stringify(newPackageData, null, 2),
    'utf-8',
  );

  console.log(`✅ package.json written to: ${outputPath}`);
}
