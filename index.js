#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const debug = require('debug')('license-report');
const getInstalledVersions = require('license-report/lib/getInstalledVersions');
const getPackageReportData = require('license-report/lib/getPackageReportData.js');
const packageDataToReportData = require('license-report/lib/packageDataToReportData');
const util = require('license-report/lib/util');

const addDependenciesRecursive = require('./lib/addDependenciesRecursive.js');
const config = require('./lib/config.js');
const getDepsIndex = require('./lib/getDepsIndex.js');
const getFormatter = require('./lib/getFormatter');
const getTree = require('./lib/getTree.js');

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

(async () => {
  if (config.help) {
    console.log(util.helpText)
    return
  }

  if (!config.package) {
    config.package = './package.json'
  }

  if (path.extname(config.package) !== '.json') {
    throw new Error('invalid package.json ' + config.package)
  }

  if ((config.output === 'tree') && !config.recurse) {
    throw new Error('output=tree requires --recurse option')
  }

  const outputFormatter = getFormatter(config.output)

  try {
    const resolvedPackageJson = path.resolve(process.cwd(), config.package)

    debug('loading %s', resolvedPackageJson)
    let packageJson
    if (fs.existsSync(resolvedPackageJson)) {
      packageJson = await util.readJson(resolvedPackageJson)
    } else {
      throw new Error(`Warning: the file '${resolvedPackageJson}' is required to get installed versions of packages`)
    }

    // build an index of all the selected dependencies
    let depsIndex = getDepsIndex(packageJson)

    // package-lock.json is required to get the installed versions from
    let packageLockJson = {}
    const resolvedPackageLockJson = path.resolve(path.dirname(resolvedPackageJson), 'package-lock.json')
    debug('loading %s', resolvedPackageLockJson)
    if (fs.existsSync(resolvedPackageLockJson)) {
      packageLockJson = await util.readJson(resolvedPackageLockJson)
    } else {
      console.warn(`Warning: the file '${resolvedPackageLockJson}' is required to get installed versions of packages`)
    }

    let depsIndexActive = depsIndex
    if (config.recurse) {
      // add dependencies of dependencies
      depsIndexActive = addDependenciesRecursive(depsIndex, packageLockJson)
    }

    const installedVersions = getInstalledVersions(packageLockJson, depsIndexActive)

    const results = await Promise.all(
      depsIndexActive.map(async (packageEntry) => {
        return await getPackageReportData(packageEntry, installedVersions)
      })
    )

    const packagesData = results
      .map(element => packageDataToReportData(element, config))
      .sort(comparePackages)

    if (config.output !== 'tree') {
      console.log(outputFormatter(packagesData, config))
    } else {
      const packagesDataTree = getTree(depsIndex, packagesData, packageLockJson)
      console.log(outputFormatter(packagesDataTree, config))
    }
  } catch (e) {
    console.error(e.stack)
    process.exit(1)
  }
})();
