// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';

import getDependencies from '../lib/getDependencies.js';
import util from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path
  .resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package.json')
  .replace(/(\s+)/g, '\\$1');

describe('getDependencies', () => {
  let packageJson;

  beforeEach(async () => {
    packageJson = await util.readJson(packageJsonPath);
  });

  it('adds all dependency types to output (no "depsType" parameter)', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions);

    assert.equal(depsIndex.length, 4);
  });

  it('adds all dependency types to output (empty "depsType" parameter)', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions, []);

    assert.equal(depsIndex.length, 4);
  });

  it('adds dependencies to output', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions, ['prod']);

    assert.equal(depsIndex.length, 3);
  });

  it('adds optionalDependencies to output', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions, ['opt']);

    assert.equal(depsIndex.length, 1);
  });

  it('adds dependencies and optionalDependencies to output', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions, ['prod', 'opt']);

    assert.equal(depsIndex.length, 4);
  });

  it('adds peerDependencies to output', () => {
    const exclusions = [];
    let depsIndex = getDependencies(packageJson, exclusions, ['peer']);

    assert.equal(depsIndex.length, 0);
  });
});
