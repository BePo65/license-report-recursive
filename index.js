#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import createDebugMessages from 'debug';
import { addLocalPackageData } from 'license-report/lib/addLocalPackageData.js';
import { addPackageDataFromRepository } from 'license-report/lib/addPackageDataFromRepository.js';
import { getNpmConfig } from 'license-report/lib/getNpmrc.js';
import { packageDataToReportData } from 'license-report/lib/packageDataToReportData.js';

import getDependencies from './lib/getDependencies.js';
import addDependenciesRecursive from './lib/addDependenciesRecursive.js';
import config from './lib/config.js';
import getFormatter from './lib/getFormatter.js';
import listToTree from './lib/listToTree.js';
import util from './lib/util.js';

const debug = createDebugMessages('license-report-recurse');

(async () => {
  if (config.help) {
    // eslint-disable-next-line security-node/detect-crlf
    console.log(util.helpText);
    return;
  }

  if (!config.package) {
    config.package = './package.json';
  }

  // get path to .npmrc to use; 'config.npmrc' can be undefined
  let npmrc = getNpmConfig(config.npmrc);

  if (path.extname(config.package) !== '.json') {
    throw new Error('invalid package.json ' + config.package);
  }

  if (config.output === 'tree' && !config.recurse) {
    throw new Error('output=tree requires --recurse option');
  }

  const outputFormatter = getFormatter(config.output);

  try {
    const resolvedPackageJson = path.resolve(process.cwd(), config.package);
    const projectRootPath = path.dirname(resolvedPackageJson);

    debug('loading %s', resolvedPackageJson);

    let packageJson;
    if (fs.existsSync(resolvedPackageJson)) {
      packageJson = await util.readJson(resolvedPackageJson);
    } else {
      throw new Error(
        `Warning: the file '${resolvedPackageJson}' is required to get installed versions of packages`,
      );
    }

    const inclusions = util.isNullOrUndefined(config.only)
      ? null
      : config.only.split(',');
    const exclusions = Array.isArray(config.exclude)
      ? config.exclude
      : [config.exclude];
    const parentPath = `>${packageJson.name}`;

    // an array with all the dependencies in the package.json under inspection
    let depsIndexBase = getDependencies(
      packageJson,
      exclusions,
      inclusions,
      parentPath,
    );
    const depsIndex = await Promise.all(
      depsIndexBase.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          config.fields,
        );
        const packagesData = await addPackageDataFromRepository(
          localDataForPackages,
          npmrc,
        );
        const basicFields = {
          alias: alias, // to get the local path of the package
          isRootNode: true, // to identify the root nodes when generating the tree view
        };
        return Object.assign(packagesData, basicFields);
      }),
    );

    // add dependencies of dependencies
    if (config.recurse === true || config.recurse === 'true') {
      let inclusionsSubDeps = ['prod', 'opt', 'peer'];
      if (inclusions !== null) {
        inclusionsSubDeps = inclusions.filter((entry) => entry !== 'dev');
      }
      await addDependenciesRecursive(
        depsIndex,
        projectRootPath,
        exclusions,
        inclusionsSubDeps,
        parentPath,
        config.fields,
        npmrc,
      );
    }

    const sortedList = depsIndex.sort(util.alphaSort);
    // remove duplicates as they are only needed to identify dependency loops
    let lastPackage = '';
    const dedupedSortedList = sortedList.filter((element) => {
      const currentPackage = `${element.name}@${element.installedVersion}`;
      if (currentPackage !== lastPackage || element.isRootNode) {
        lastPackage = currentPackage;
        return true;
      }
      return false;
    });

    if (config.output !== 'tree') {
      // keep only fields that are defined in the configuration
      const packagesList = await Promise.all(
        dedupedSortedList.map(async (element) => {
          return packageDataToReportData(element, config);
        }),
      );

      // eslint-disable-next-line security-node/detect-crlf
      console.log(outputFormatter(packagesList, config));
      debug(`emitted list with ${packagesList.length} entries`);
    } else {
      const packagesTree = listToTree(dedupedSortedList, config);
      // eslint-disable-next-line security-node/detect-crlf
      console.log(outputFormatter(packagesTree, config));
      debug(`emitted tree with ${packagesTree.length} base nodes`);
    }
  } catch (e) {
    console.error(e.stack);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();
