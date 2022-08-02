import fs from 'node:fs';
import path from 'node:path';

import getDependencies from './getDependencies.js';
import util from './util.js';

/**
 * Does an object exist within depsIndex that matches the given element?
 * @param {string} path - path to parent element
 * @param {object} element - element to be found
 * @returns true=element exists
 */
function pathIncludes(path, element) {
  return (path.includes(element.fullName) || path.endsWith(element.fullName))
}

/**
 * Create index with all packages from depsIndex and all dependencies
 * of the packages in depsIndex (recursively).
 * 'inclusions' is equivalent to the 'only' parameter in the config definition, split into an array of strings.
 * Complete list: ['prod', 'dev', 'opt', 'peer'] or null or undefined.
 * @param {Array<Object>} depsIndex - array with selected dependencies from package.json
 * @param {string} projectRootPath - path of the package.json the report is generated for
 * @param {string[]} exclusions - array of package names to be excluded
 * @param {string[]} inclusions - array of strings of types of dependencies to be included (from config.only)
 * @param {string} parentPath - dependency path to the parent (e.g. '>got>once')
 * @returns array of objects with all dependent packages
 */
async function addDependenciesRecursive(depsIndex, projectRootPath, exclusions, inclusions, parentPath) {
  // deep clone original depsIndex array
  let depsIndexRecursiveFlat = util.deepCloneObject(depsIndex);
  let depsIndexRecursiveTree = util.deepCloneObject(depsIndex);

  // create list of indirect dependencies
  for (let i = 0; i < depsIndex.length; i++) {
    const element = depsIndex[i];
    let packageFolderName;
    if (element.alias.length === 0) {
      packageFolderName = element.fullName;
    } else {
      packageFolderName = element.alias;
    }

    if(!pathIncludes(parentPath, element)) {
      const elementPackageJsonPath = path.join(projectRootPath, 'node_modules', packageFolderName, 'package.json');
      // look for dependencies of package
      if (fs.existsSync(elementPackageJsonPath)) {
        const packageJson = await util.readJson(elementPackageJsonPath);
        const parentPathSubelement = `${parentPath}>${packageJson.name}`
        const selectedDependencies = getDependencies(packageJson, exclusions, inclusions, parentPathSubelement);
        if (selectedDependencies.length > 0) {
          const { depsIndexRecursiveFlat: flat, depsIndexRecursiveTree: tree } = await addDependenciesRecursive(selectedDependencies, projectRootPath, exclusions, inclusions, parentPathSubelement);
          depsIndexRecursiveFlat.push(...flat);
          const sourceItemInPackagesData = depsIndexRecursiveTree.find(treeElement => ((treeElement.fullName === element.fullName) && (treeElement.alias === element.alias)));
          sourceItemInPackagesData.requires = util.deepCloneObject(tree);
        }
      }
    } else {
      const sourceItemInPackagesData = depsIndexRecursiveTree.find(treeElement => ((treeElement.fullName === element.fullName) && (treeElement.alias === element.alias)));
      sourceItemInPackagesData.deduped = true;
    }
  }

  return { depsIndexRecursiveFlat, depsIndexRecursiveTree };
}

export default addDependenciesRecursive;
