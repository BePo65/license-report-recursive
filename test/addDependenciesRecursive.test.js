// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import { expect } from 'chai';
import path from 'node:path';
import url from 'node:url';
import { addLocalPackageData } from 'license-report/lib/addLocalPackageData.js';
import { addPackageDataFromRepository } from 'license-report/lib/addPackageDataFromRepository.js';

import addDependenciesRecursive from '../lib/addDependenciesRecursive.js';
import config from '../lib/config.js';
import getDependencies from '../lib/getDependencies.js';
import util from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path
  .resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package.json')
  .replace(/(\s+)/g, '\\$1');

const projectRootPath = path
  .resolve(__dirname, 'fixture', 'addDependenciesRecursive')
  .replace(/(\s+)/g, '\\$1');

describe('addDependenciesRecursive', function () {
  let packageJson;
  const fields = [
    'relatedTo',
    'name',
    'licensePeriod',
    'material',
    'licenseType',
    'link',
    'definedVersion',
    'author',
  ];
  let npmrc;

  this.timeout(6000);
  this.slow(6000);

  before(() => {
    npmrc = {
      defaultRegistry: config.registry,
    };
  });

  beforeEach(async () => {
    packageJson = await util.readJson(packageJsonPath);
  });

  it('generates flat list for all dependency types', async () => {
    const depsPackageJson = getDependencies(packageJson, [], null, '');
    const depsIndex = await Promise.all(
      depsPackageJson.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          fields,
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
    expect(depsIndex.length).to.equal(4);

    await addDependenciesRecursive(
      depsIndex,
      projectRootPath,
      [],
      [],
      '',
      fields,
      npmrc,
    );
    expect(depsIndex.length).to.equal(10);
  });

  it('generates flat list for prod only', async () => {
    const inclusions = ['prod'];
    const depsPackageJson = getDependencies(packageJson, [], inclusions, '');
    const depsIndex = await Promise.all(
      depsPackageJson.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          fields,
          npmrc,
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
    expect(depsIndex.length).to.equal(3);

    await addDependenciesRecursive(
      depsIndex,
      projectRootPath,
      [],
      inclusions,
      '',
      fields,
      npmrc,
    );
    expect(depsIndex.length).to.equal(4);
  });

  it('generates flat list for prod and opt only', async () => {
    const inclusions = ['prod', 'opt'];
    const depsPackageJson = getDependencies(packageJson, [], inclusions, '');
    const depsIndex = await Promise.all(
      depsPackageJson.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          fields,
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
    expect(depsIndex.length).to.equal(4);

    await addDependenciesRecursive(
      depsIndex,
      projectRootPath,
      [],
      inclusions,
      '',
      fields,
      npmrc,
    );
    expect(depsIndex.length).to.equal(5);
  });

  it('generates flat list for empty only definition', async () => {
    const inclusions = [];
    const depsPackageJson = getDependencies(packageJson, [], inclusions, '');
    const depsIndex = await Promise.all(
      depsPackageJson.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          fields,
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
    expect(depsIndex.length).to.equal(4);

    await addDependenciesRecursive(
      depsIndex,
      projectRootPath,
      [],
      inclusions,
      '',
      fields,
      npmrc,
    );
    expect(depsIndex.length).to.equal(10);
  });

  it('generates flat list and tree with empty string in only definition', async () => {
    const inclusions = [''];
    const depsPackageJson = getDependencies(packageJson, [], inclusions);
    const depsIndex = await Promise.all(
      depsPackageJson.map(async (element) => {
        const alias = element.alias;
        const localDataForPackages = await addLocalPackageData(
          element,
          projectRootPath,
          fields,
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
    expect(depsIndex.length).to.equal(0);

    await addDependenciesRecursive(
      depsIndex,
      projectRootPath,
      [],
      inclusions,
      '',
      fields,
      npmrc,
    );
    expect(depsIndex.length).to.equal(0);
  });
});
