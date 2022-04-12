function deepCloneObject(source) {
  return JSON.parse(JSON.stringify(source))
}

function clonePackageFromPackageLock(name, packageLockDependencies) {
  let result
  for (const packageName of Object.keys(packageLockDependencies)) {
    // (entry.name === newEntry.name && entry.version === newEntry.version && entry.scope === newEntry.scope)
    if (packageName === name) {
      result = deepCloneObject(packageLockDependencies[name])
      break
    }
  }

  return result
}

function clonePackageFromPackagesData(name, packagesData) {
  let result = packagesData.find(package => package.name === name)

  if (!result) {
    result = deepCloneObject(result)
  }

  return result
}

function traverseArray(packagesArray, packagesData, packageLockDependencies) {
  packagesArray.map(item => {
    const itemClonedFromPackageLock = clonePackageFromPackageLock(item.name, packageLockDependencies)
    if (itemClonedFromPackageLock?.requires) {
      item.requires = []
      for (const requiredPackageName in itemClonedFromPackageLock.requires) {
        const childPackage = clonePackageFromPackagesData(requiredPackageName, packagesData)
        if (childPackage) {
          item.requires.push(childPackage)
        } else {
          console.log(`*** Error - dependency '${requiredPackageName}' of '${item.name}' not found.`)
        }
      }

      // handle the packages in the requires property
      traverseArray(item.requires, packagesData, packageLockDependencies)
    }
  })
}

function comparePackages(a, b) {
  const nameA = a.name;
  const nameB = b.name;

  if (nameA < nameB) {
    return -1;
  }

  if (nameA > nameB) {
    return 1;
  }

  return 0;
}

module.exports = function(depsIndex, packagesData, packageLockJson) {
  const packageLockDependencies = packageLockJson.dependencies

  // create the list of all packages found in depsIndex as top level of the result
  let result = depsIndex.flatMap(sourceItem => {
    const name = sourceItem.fullName
    const version = sourceItem.version

    // default action: don't add element to resulting array
    let targetItem = []
    const sourceItemInPackagesData = packagesData.find(element => ((element.name === name) && (element.definedVersion === version)))
    if (sourceItemInPackagesData) {
      targetItem = [ deepCloneObject(sourceItemInPackagesData) ]
    }
    return targetItem
  })

  traverseArray(result, packagesData, packageLockDependencies)

  return result.sort(comparePackages)
}
