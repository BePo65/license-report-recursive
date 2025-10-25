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
    assert.equal(
      packagesTree[0].requires[1].requires[0].name,
      'defer-to-connect',
    );
    assert.equal(packagesTree[0].requires[1].requires[0].requires.length, 0);
  });
});
