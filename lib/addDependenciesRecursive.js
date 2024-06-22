import fs from 'node:fs';
import path from 'node:path';
import createDebugMessages from 'debug';

import addLocalPackageData from 'license-report/lib/addLocalPackageData.js';
import addPackageDataFromRepository from 'license-report/lib/addPackageDataFromRepository.js';

import getDependencies from './getDependencies.js';
import util from './util.js';

const debug = createDebugMessages('license-report-recurse');

/**
 * Does an object exist within depsIndex that matches the given element?
 * @param {string} path - path to parent element
 * @param {object} element - element to be found
 * @returns {boolean} true=element exists
 */
const pathIncludes = (path, element) => {
  return `${path}>`.includes(`>${element.name}>`)
}

/**
 * Update the given index (depsIndex = selected dependencies of the package.json under inspection)
 * with all dependencies of the packages in depsIndex (recursively).
 * 'inclusions' is equivalent to the 'only' parameter in the config definition, split into an array of strings;
 * to select all dependencies use ['prod', 'dev', 'opt', 'peer'] or null or undefined.
 * In subdependencies only 'dependencies' are considered.
 * This function modifies the given depsIndex array (given as a reference).
 * @param {Array<object>} depsIndex - array with selected dependencies from package.json the report is generated for
 * @param {string} projectRootPath - path of the package.json the report is generated for
 * @param {string[]} exclusions - array of package names to be excluded
 * @param {string[]} inclusions - array of strings of types of dependencies to be included (from config.only)
 * @param {string} rootPath - dependency path of the root package (= name of project; e.g. '>vscode-mocha-sidebar')
 * @param {string[]}  fields - 'fields' list from the global configuration object
 */
const addDependenciesRecursive = async (depsIndex, projectRootPath, exclusions, inclusions, rootPath, fields) => {
  let startOfSublist = 0;
  let endOfSublist = depsIndex.length - 1;
  let currentParentPath = rootPath;
  let recurseLevel = 0;

  do {
    debug(`*** Level ${recurseLevel.toString()}`);

    // create list of indirect dependencies
    for (let i = startOfSublist; i <= endOfSublist; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const element = depsIndex[i];
      currentParentPath = element.path.slice(0, element.path.lastIndexOf('>'));

      debug(`    + ${currentParentPath} -> ${element.name}@${element.installedVersion}`);

      let packageFolderName;
      if (element.alias.length === 0) {
        packageFolderName = element.name;
      } else {
        packageFolderName = element.alias;
      }

      if (!pathIncludes(currentParentPath, element)) {
        const elementPackageJsonPath = path.join(projectRootPath, 'node_modules', packageFolderName, 'package.json');
        // look for dependencies of package
        if (fs.existsSync(elementPackageJsonPath)) {
          const packageJson = await util.readJson(elementPackageJsonPath);
          const selectedDependenciesBase = getDependencies(packageJson, exclusions, inclusions, element.path);
          const selectedDependenciesComplete = await Promise.all(
            selectedDependenciesBase.map(async (element) => {
              const alias = element.alias;
              const localDataForPackages = await addLocalPackageData(element, elementPackageJsonPath, fields);
              const packagesData = await addPackageDataFromRepository(localDataForPackages);
              return Object.assign(packagesData, { alias: alias });
            })
          );

          if (selectedDependenciesComplete.length > 0) {
            // mark elements in 'requires' that would create a dependency loop
            selectedDependenciesComplete.forEach(requiredPackage => {
              if (pathIncludes(requiredPackage.path.slice(0, element.path.lastIndexOf('>')), requiredPackage)) {
                requiredPackage.dependencyLoop = true;
              }
            });

            // prettify result by sorting list
            element.requires = selectedDependenciesComplete.sort(util.alphaSort);
            depsIndex.push(...selectedDependenciesComplete);
          }
        }
      } else {
        // mark elements that would create a dependency loop
        element.dependencyLoop = true;
      }
    }

    // repeat actions on elements newly added to list
    startOfSublist = endOfSublist + 1;
    endOfSublist = depsIndex.length - 1;
    ++recurseLevel;
  } while (startOfSublist <= endOfSublist);
}

export default addDependenciesRecursive;
