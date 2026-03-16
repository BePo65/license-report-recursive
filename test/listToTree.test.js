// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';

import listToTree from '../lib/listToTree.js';
import util from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const dedupedSortedListPath = path
  .resolve(__dirname, 'fixture', 'getTree', 'sortedList.json')
  .replace(/(\s+)/g, '\\$1');

const testConfigPath = path
  .resolve(__dirname, 'fixture', 'getTree', 'testConfig.json')
  .replace(/(\s+)/g, '\\$1');

const scopedDistinctSortedListPath = path
  .resolve(__dirname, 'fixture', 'getTreeScopedDistinct', 'sortedList.json')
  .replace(/(\s+)/g, '\\$1');

const scopedDistinctConfigPath = path
  .resolve(__dirname, 'fixture', 'getTreeScopedDistinct', 'testConfig.json')
  .replace(/(\s+)/g, '\\$1');

const dependencyLoopSortedListPath = path
  .resolve(__dirname, 'fixture', 'getTreeDependencyLoopFlagged', 'sortedList.json')
  .replace(/(\s+)/g, '\\$1');

const dependencyLoopConfigPath = path
  .resolve(__dirname, 'fixture', 'getTreeDependencyLoopFlagged', 'testConfig.json')
  .replace(/(\s+)/g, '\\$1');

const dedupeCycleSortedListPath = path
  .resolve(__dirname, 'fixture', 'getTreeDedupeCycle', 'sortedList.json')
  .replace(/(\s+)/g, '\\$1');

const dedupeCycleConfigPath = path
  .resolve(__dirname, 'fixture', 'getTreeDedupeCycle', 'testConfig.json')
  .replace(/(\s+)/g, '\\$1');

describe('getTree', () => {
  let dedupedSortedList;
  let testConfig;

  beforeEach(async () => {
    dedupedSortedList = await util.readJson(dedupedSortedListPath);
    testConfig = await util.readJson(testConfigPath);
  });

  it('does get json tree of dependencies', async () => {
    const packagesTree = listToTree(dedupedSortedList, testConfig);

    assert.equal(packagesTree.length, 1);
    assert.equal(packagesTree[0].name, 'got');
    assert.ok(packagesTree[0].isRootNode === undefined);
    assert.ok(packagesTree[0].requires !== undefined);
    assert.equal(packagesTree[0].requires.length, 13);
    assert.ok(packagesTree[0].requires[1].requires !== undefined);
    assert.equal(packagesTree[0].requires[1].name, '@szmarczak/http-timer');
    assert.equal(packagesTree[0].requires[1].requires.length, 1);
    assert.equal(packagesTree[0].requires[1].requires[0].name, 'defer-to-connect');
    assert.equal(packagesTree[0].requires[1].requires[0].requires.length, 0);
  });

  it('keeps scoped packages with equal name/version distinct', async () => {
    const testList = await util.readJson(scopedDistinctSortedListPath);
    const cfg = await util.readJson(scopedDistinctConfigPath);

    const packagesTree = listToTree(testList, cfg);

    assert.equal(packagesTree.length, 1);
    assert.equal(packagesTree[0].requires.length, 2);
    assert.equal(packagesTree[0].requires[0].fullName, '@scope-a/core');
    assert.equal(packagesTree[0].requires[1].fullName, '@scope-b/core');
  });

  it('keeps tree JSON-serializable when dependency loops are flagged', async () => {
    const testList = await util.readJson(dependencyLoopSortedListPath);
    const cfg = await util.readJson(dependencyLoopConfigPath);

    const packagesTree = listToTree(testList, cfg);
    const json = JSON.stringify(packagesTree);
    const parsed = JSON.parse(json);

    assert.equal(parsed[0].requires[0].requires[0].requires[0].requires[0].dependencyLoop, true);
  });

  it('keeps tree JSON-serializable when a cycle is introduced by canonical package ids', async () => {
    const testList = await util.readJson(dedupeCycleSortedListPath);
    const cfg = await util.readJson(dedupeCycleConfigPath);

    const packagesTree = listToTree(testList, cfg);
    const json = JSON.stringify(packagesTree);
    const parsed = JSON.parse(json);

    const alphaBranch = parsed[0].requires.find((entry) => entry.fullName === 'alpha');
    const loopPlaceholder = alphaBranch.requires[0].requires[0].requires[0].requires[0].requires[0];

    assert.equal(loopPlaceholder.fullName, 'alpha');
    assert.equal(loopPlaceholder.requires[0].dependencyLoop, true);
  });
});
