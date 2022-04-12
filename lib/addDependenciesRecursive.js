const addPackagesToIndex = require('./addPackagesToIndex')

/**
 * Create index with all packages from depsIndex and all dependencies
 * of the packages in depsIndex (recursively)
 * @param {Array<Object>} depsIndex - array with selected dependencies from package.json
 * @param {*} packageLockJson - content of package-lock.json file for package.json
 * @returns array of objects with all dependent packages
 */
module.exports = function(depsIndex, packageLockJson) {
  // deep clone original depsIndex list
  let depsIndexRecursive = JSON.parse(JSON.stringify(depsIndex))

  // create list of indirect dependencies
  const packageLockDependencies = packageLockJson.dependencies
  for (let i = 0; i < depsIndexRecursive.length; i++) {
    const packageName = depsIndexRecursive[i].fullName
    const packageLockEntry = packageLockDependencies[packageName]

    // look for dependencies in packageLockJson
    if (packageLockEntry?.requires) {
      addPackagesToIndex(packageLockEntry.requires, depsIndexRecursive, [])
    }
  }

  return depsIndexRecursive
}