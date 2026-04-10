// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';

import listToTree from '../lib/listToTree.js';
import util from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const rootNodesPlainListPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'rootNodes.plain.json')
  .replace(/(\s+)/g, '\\$1');

const testPlainConfigPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'testConfig.plain.json')
  .replace(/(\s+)/g, '\\$1');

const rootNodesScopedListPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'rootNodes.scoped.json')
  .replace(/(\s+)/g, '\\$1');

const testScopedConfigPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'testConfig.scoped.json')
  .replace(/(\s+)/g, '\\$1');

const rootNodesLoopListPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'rootNodes.loop.json')
  .replace(/(\s+)/g, '\\$1');

const rootNodesLoopConfigPath = path
  .resolve(__dirname, 'fixture', 'listToTree', 'testConfig.loop.json')
  .replace(/(\s+)/g, '\\$1');

describe('listToTree', () => {
  let dedupedSortedList;
  let testConfig;

  beforeEach(async () => {
    dedupedSortedList = await util.readJson(rootNodesPlainListPath);
    testConfig = await util.readJson(testPlainConfigPath);
  });

  it('does get json tree of dependencies', async () => {
    const packagesTree = listToTree(dedupedSortedList, testConfig);

    assert.equal(packagesTree.length, 1);
    assert.equal(packagesTree[0].name, 'got');
    assert.ok(packagesTree[0].isRootNode === undefined);
    assert.ok(packagesTree[0].requires !== undefined);
    assert.equal(packagesTree[0].requires.length, 4);
    assert.ok(packagesTree[0].requires[1].requires !== undefined);
    assert.equal(packagesTree[0].requires[2].name, '@types/responselike');
    assert.equal(packagesTree[0].requires[2].requires.length, 1);
    assert.equal(packagesTree[0].requires[2].requires[0].name, '@types/node');
    assert.ok(packagesTree[0].requires[2].requires[0].requires === undefined);
  });

  it('keeps scoped packages with equal name/version distinct', async () => {
    const testList = await util.readJson(rootNodesScopedListPath);
    const cfg = await util.readJson(testScopedConfigPath);

    const packagesTree = listToTree(testList, cfg);

    assert.equal(packagesTree.length, 1);
    assert.equal(packagesTree[0].requires.length, 2);
    assert.equal(packagesTree[0].requires[0].fullName, '@scope-a/core');
    assert.equal(packagesTree[0].requires[1].fullName, '@scope-b/core');
  });

  it('keeps tree JSON-serializable when dependency loops are flagged', async () => {
    const testList = await util.readJson(rootNodesLoopListPath);
    const cfg = await util.readJson(rootNodesLoopConfigPath);

    const packagesTree = listToTree(testList, cfg);

    assert.equal(
      packagesTree[0].requires[0].requires[0].requires[0].requires[0].dependencyLoop,
      true,
    );
  });
});
