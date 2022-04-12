// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');

const util = require('license-report/lib/util');

const getTree = require('../lib/getTree.js');

chai.use(chaiAsPromised);
const expect = chai.expect;

const depsIndexPath = path
	.resolve(__dirname, 'fixture', 'getTree', 'depsIndex.json')
	.replace(/(\s+)/g, '\\$1')

const packagesDataPath = path
	.resolve(__dirname, 'fixture', 'getTree', 'packagesData.json')
	.replace(/(\s+)/g, '\\$1')

const packageLockJsonPath = path
	.resolve(__dirname, 'fixture', 'getTree', 'package-lock.json')
	.replace(/(\s+)/g, '\\$1')

describe('getTree', () => {
	let depsIndex
	let packagesData
	let packageLockJson

	beforeEach(async () => {
		depsIndex = await util.readJson(depsIndexPath)
		packagesData = await util.readJson(packagesDataPath)
		packageLockJson = await util.readJson(packageLockJsonPath)
	})

  it('does get json tree of dependencies', () => {
    const packagesDataTree = getTree(depsIndex, packagesData, packageLockJson)

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