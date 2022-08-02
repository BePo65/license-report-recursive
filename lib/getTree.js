import util from './util.js';

/**
 * Find element in packagesData and return clone of the found data
 * @param {object} element dependency data from 'addPackagesToIndex'
 * @param {object[]} packagesData - array with details about every dependent package in the project under inspection
 * @returns 
 */
function getClonedPackageFromPackagesData(element, packagesData) {
  let result = packagesData.find(packageData => packageData.name === element.fullName)

  if (result !== undefined) {
    result = util.deepCloneObject(result)
  }

  return result
}

/**
 * Compare 2 elements from packagesData
 * @param {object} a - element from packagesData
 * @param {object} b - element from packagesData
 * @returns 
 */
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

/**
 * Replace all elements of one level of the dependency tree with the data from packagesData and recurse
 * @param {object[]} packagesArray - dependencies of one level in the tree
 * @param {object[]} packagesData - array with details about every dependent package in the project under inspection
 * @return {object[]} tree with data from the packagesData list
 */
 function getTree(depsIndexTree, packagesData) {
  return depsIndexTree.map(item => {
    let result = {}
    const itemData = getClonedPackageFromPackagesData(item, packagesData)
    if (itemData !== undefined) {
      result = itemData
      if (item.deduped) {
        result.deduped = true
      }
      if (item.requires !== undefined) {
        const dependencies = getTree(item.requires, packagesData)
        if ((dependencies !== undefined) && Array.isArray(dependencies)) {
          result.requires = dependencies.sort(comparePackages)
        }
      }
      return result
    } else {
      console.error(`*** Error - data for package '${item.fullName}' not found.`)
    }
  })
}

export default getTree;
