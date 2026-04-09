#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import createDebugMessages from 'debug';
import { addLocalPackageData } from 'license-report/lib/addLocalPackageData.js';
import { addPackageDataFromRepository } from 'license-report/lib/addPackageDataFromRepository.js';
import { getNpmConfig } from 'license-report/lib/getNpmrc.js';
import { packageDataToReportData } from 'license-report/lib/packageDataToReportData.js';
import addDependenciesRecursive from './lib/addDependenciesRecursive.js';
import config from './lib/config.js';
import getDependencies from './lib/getDependencies.js';
import getFormatter from './lib/getFormatter.js';
import listToTree from './lib/listToTree.js';
import { getPackageIdWithVersion } from './lib/packageIdentity.js';
import util from './lib/util.js';

const debug = createDebugMessages('license-report-recurse');

(async () => {
  if (config.help) {
    console.log(util.helpText);
    return;
  }

  if (!config.package) {
    config.package = './package.json';
  }

  // get path to .npmrc to use; 'config.npmrc' can be undefined
  const npmrc = getNpmConfig(config.npmrc);

  if (path.extname(config.package) !== '.json') {
    throw new Error(`invalid package.json ${config.package}`);
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

    const inclusions = util.isNullOrUndefined(config.only) ? null : config.only.split(',');
    const exclusions = Array.isArray(config.exclude) ? config.exclude : [config.exclude];
    const parentPath = `>${packageJson.name}`;

    /**
     * Create an array with all the dependencies in the package.json under inspection
     * Fields in an entry are
     * 'name', 'fullName', 'scope', 'alias', 'version'
     */
    const depsIndexBase = getDependencies(packageJson, exclusions, inclusions, parentPath);

    const depsIndex = await Promise.all(
      /**
       * Add fields from the local directory node_modules
       * Fields ar
       * 'path', 'author', 'installedVersion', 'licenseType' + fields from configuration
       */
      depsIndexBase.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          config.fields,
        );

        /**
         * Add fields from remote repository
         * Fields are
         * 'link', 'installedFrom', 'definedVersion', 'remoteVersion',
         * 'latestRemoteVersion', 'latestRemoteModified'
         */
        const packagesData = await addPackageDataFromRepository(localDataForPackages, npmrc);
        const basicFields = {
          alias: alias, // to get the local path of the package
          isRootNode: true, // to identify the root nodes when generating the tree view
        };
        return Object.assign(packagesData, basicFields);
      }),
    );

    // add dependencies of dependencies (recursive)
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

    /**
     * At this point depsIndex contains all packages of the project and,
     * if recurse=true, each entry has a field "requires" which contains
     * all dependencies of this dependency as a tree of objects.
     * devDependencies of dependencies are ignored;
     * 'config.only' defaults to 'prod', 'opt', 'peer'
     */
    if (config.output !== 'tree') {
      const sortedList = depsIndex.sort(util.alphaSort);
      // remove duplicates as they are only needed to identify dependency loops
      let lastPackage = '';
      const dedupedSortedList = sortedList.filter((element) => {
        const currentPackage = getPackageIdWithVersion(element);
        if (currentPackage !== lastPackage || element.isRootNode) {
          lastPackage = currentPackage;
          return true;
        }
        return false;
      });

      // keep only fields that are defined in the configuration
      const packagesList = await Promise.all(
        dedupedSortedList.map(async (element) => {
          return packageDataToReportData(element, config);
        }),
      );

      console.log(outputFormatter(packagesList, config));
      debug(`emitted list with ${packagesList.length} entries`);
    } else {
      // extract root nodes
      const rootNodes = depsIndex.filter((element) => element.isRootNode);
      const packagesTree = listToTree(rootNodes, config);
      console.log(outputFormatter(packagesTree, config));
      debug(`emitted tree with ${packagesTree.length} base nodes`);
    }
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
})();
