#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import createDebugMessages from 'debug';
import addLocalPackageData from 'license-report/lib/addLocalPackageData.js';
import addPackageDataFromRepository from 'license-report/lib/addPackageDataFromRepository.js';
import packageDataToReportData from 'license-report/lib/packageDataToReportData.js';

import getDependencies from './lib/getDependencies.js';
import addDependenciesRecursive from './lib/addDependenciesRecursive.js';
import config from './lib/config.js';
import getFormatter from './lib/getFormatter.js';
import getTree from './lib/getTree.js';
import util from './lib/util.js';

const debug = createDebugMessages('license-report');

(async () => {
  if (config.help) {
    console.log(util.helpText);
    return;
  }

  if (!config.package) {
    config.package = './package.json';
  }

  if (path.extname(config.package) !== '.json') {
    throw new Error('invalid package.json ' + config.package);
  }

  if ((config.output === 'tree') && !config.recurse) {
    throw new Error('output=tree requires --recurse option');
  }

  const outputFormatter = getFormatter(config.output);

  try {
    const resolvedPackageJson = path.resolve(process.cwd(), config.package);
    debug('loading %s', resolvedPackageJson);

    let packageJson
    if (fs.existsSync(resolvedPackageJson)) {
      packageJson = await util.readJson(resolvedPackageJson);
    } else {
      throw new Error(`Warning: the file '${resolvedPackageJson}' is required to get installed versions of packages`);
    }

    const inclusions = util.isNullOrUndefined(config.only) ? null : config.only.split(',');
    const exclusions = Array.isArray(config.exclude) ? config.exclude : [config.exclude];
    const parentPath = `>${packageJson.name}`;

    // an array with all the dependencies in the package.json under inspection
    let depsIndex = getDependencies(packageJson, exclusions, inclusions, parentPath)

    const projectRootPath = path.dirname(resolvedPackageJson)
    let depsIndexRecursiveFlat = depsIndex
    let depsIndexRecursiveTree = depsIndex

    // add dependencies of dependencies
    if ((config.recurse === true) || (config.recurse === 'true')) {
      let inclusionsSubDeps = ['prod', 'opt', 'peer'];
      if (inclusions !== null) {
        inclusionsSubDeps = inclusions.filter(entry => entry !== 'dev');
      }
      const { depsIndexRecursiveFlat: flat, depsIndexRecursiveTree: tree } = await addDependenciesRecursive(depsIndex, projectRootPath, exclusions, inclusionsSubDeps, parentPath)
      depsIndexRecursiveFlat = flat
      depsIndexRecursiveTree = tree
    }

    const packagesData = await Promise.all(
      depsIndexRecursiveFlat.map(async (element) => {
        const localDataForPackages = await addLocalPackageData(element, projectRootPath)
        const packagesData = await addPackageDataFromRepository(localDataForPackages)
        return packageDataToReportData(packagesData, config)
      })
    )

    if (config.output !== 'tree') {
      console.log(outputFormatter(packagesData, config))
    } else {
      const packagesDataTree = getTree(depsIndexRecursiveTree, packagesData)
      console.log(outputFormatter(packagesDataTree, config))
    }
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
})();
