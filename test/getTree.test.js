// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import path from 'node:path';
import url from 'node:url';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import getTree from '../lib/getTree.js';
import util from '../lib/util.js';

chai.use(chaiAsPromised);
const expect = chai.expect;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packagesDataPath = path
	.resolve(__dirname, 'fixture', 'getTree', 'packagesData.json')
	.replace(/(\s+)/g, '\\$1')

const depsIndexRecursiveTreePath = path
	.resolve(__dirname, 'fixture', 'getTree', 'depsIndexRecursiveTree.json')
	.replace(/(\s+)/g, '\\$1')

describe('getTree', () => {
	let packagesData
	let depsIndexRecursiveTree

	beforeEach(async () => {
		depsIndexRecursiveTree = await util.readJson(depsIndexRecursiveTreePath)
		packagesData = await util.readJson(packagesDataPath)
	})

  it('does get json tree of dependencies', () => {
    const packagesDataTree = getTree(depsIndexRecursiveTree, packagesData, [])

		expect(packagesDataTree.length).to.equal(1)
		expect(packagesDataTree[0].name).to.equal('got')
		expect(packagesDataTree[0].requires).not.to.be.undefined
		expect(packagesDataTree[0].requires.length).to.equal(13)
		expect(packagesDataTree[0].requires[1].requires).not.to.be.undefined
		expect(packagesDataTree[0].requires[1].name).to.equal('@szmarczak/http-timer')
		expect(packagesDataTree[0].requires[1].requires.length).to.equal(1)
		expect(packagesDataTree[0].requires[1].requires[0].name).to.equal('defer-to-connect')
		expect(packagesDataTree[0].requires[1].requires[0].requires).to.be.undefined
  });
});