import fs from 'node:fs';
import semver from 'semver';

/**
 * Get an object by asynchronously reading a file
 * @param {string} path - path of the json file
 * @returns {object} generated from the content of the file
 */
 async function readJson(path) {
  const data = await fs.promises.readFile(path)
  return JSON.parse(data)
}

/**
 * Make a deep clone of an object with simple elements (string, number, object literal, flat array)
 * @param {object} source 
 * @returns cloned object
 */
function deepCloneObject(source) {
  return JSON.parse(JSON.stringify(source))
}

function isNullOrUndefined(element) {
  return ((element === undefined) || (element === null))
}

/**
 * Comparision function to sort an array of object with package date.
 * Sorting is done by
 * 1. lowercase fullname
 * 2. installedVersion
 * 3. packages with 'isRootNode' are placed before elements that do not have this field
 *  or that have 'isRootNode' == false.
 * @param {object} elementA - first package data object to compare
 * @param {object} elementB - second package data object to compare
 * @returns -1 (A<B), 0 (A==B), +1 (A>B)
 */
function alphaSort(elementA, elementB) {
  const a = elementA.fullName.toLowerCase();
  const b = elementB.fullName.toLowerCase();
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }

  // names are equal
  const aVersion = elementA.installedVersion;
  const bVersion = elementB.installedVersion;
  if (semver.lt(aVersion, bVersion)) {
    return -1;
  }
  if (semver.gt(aVersion, bVersion)) {
    return 1;
  }

  // name and installedVersion are equal
  const aIsRoot = elementA.isRootNode || false;
  const bIsRoot = elementB.isRootNode || false;
  if (aIsRoot && !bIsRoot) {
    return -1;
  }
  if (!aIsRoot && bIsRoot) {
    return 1;
  }
  return 0;
}

const helpText = `Generate a detailed report of the licenses of all projects dependencies with option recursive.

Usage: license-report-recursive [options]

Options:
  --recurse                             Read dependencies recursive.
  
  --csvHeaders                          Add header row to csv output containing labels for all fields.
  
  --delimiter="|"                       Set delimiter for csv output (defaults to ",").

  --exclude=<name of 1 package>         Exclude a package from output (can be added multiple times).

  --html.cssFile=</a/b/c.css>           Use custom stylesheet for html output.

  --only={dev|prod}                     Output licenses from devDependencies or dependencies (defaults to both).

  --output={table|json|csv|html|tree}   Select output format (defaults to json).

  --package=</path/to/package.json>     Use another package.json file (defaults to current project).

  --registry=<https://myregistry.com/>  Use private repository for information about packages (defaults to npmjs.org).

  --<field>.label=<new-label>           Set label for output field. Allowed field names are:
                                        department, relatedTo, name, licensePeriod, material, licenseType,
                                        link, remoteVersion, installedVersion, definedVersion, author, installedFrom,
                                        latestRemoteVersion, latestRemoteModified.

  --<field>.value=<new-value>           Set value for static output field. Allowed field names are:
                                        department, relatedTo, licensePeriod, material.
`

export default {
  readJson,
  deepCloneObject,
  isNullOrUndefined,
  alphaSort,
  helpText
};
