// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import path from 'node:path';
import url from 'node:url';

import { expect } from 'chai';

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
    const packagesTree = await listToTree(dedupedSortedList, testConfig);

    expect(packagesTree.length).to.equal(1);
    expect(packagesTree[0].name).to.equal('got');
    expect(packagesTree[0].isRootNode).to.be.undefined;
    expect(packagesTree[0].requires).not.to.be.undefined;
    expect(packagesTree[0].requires.length).to.equal(13);
    expect(packagesTree[0].requires[1].requires).not.to.be.undefined;
    expect(packagesTree[0].requires[1].name).to.equal('@szmarczak/http-timer');
    expect(packagesTree[0].requires[1].requires.length).to.equal(1);
    expect(packagesTree[0].requires[1].requires[0].name).to.equal(
      'defer-to-connect',
    );
    expect(packagesTree[0].requires[1].requires[0].requires).to.be.undefined;
  });
});
