// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import path from 'node:path';
import url from 'node:url';

import addDependenciesRecursive from '../lib/addDependenciesRecursive.js';
import getDependencies from '../lib/getDependencies.js';
import util from '../lib/util.js';

chai.use(chaiAsPromised);
const expect = chai.expect;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path
	.resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package.json')
	.replace(/(\s+)/g, '\\$1')

const projectRootPath = path
	.resolve(__dirname, 'fixture', 'addDependenciesRecursive')
	.replace(/(\s+)/g, '\\$1')

describe('addDependenciesRecursive', () => {
	let packageJson

	beforeEach(async () => {
		packageJson = await util.readJson(packageJsonPath)
	})

	it('generates flat list and tree for all dependency types', async () => {
		const depsIndex = getDependencies(packageJson, [], null, '')
		const { depsIndexRecursiveFlat, depsIndexRecursiveTree } = await addDependenciesRecursive(depsIndex, projectRootPath, [], [], '')

		expect(depsIndex.length).to.equal(4)
		expect(depsIndexRecursiveFlat.length).to.equal(10)
		expect(depsIndexRecursiveTree.length).to.equal(4)
		expect(depsIndexRecursiveTree[0].fullName).to.equal('once')
		expect(depsIndexRecursiveTree[0].requires.length).to.equal(2)
		expect(depsIndexRecursiveTree[0].requires[0].fullName).to.equal('wrappy')
		expect(depsIndexRecursiveTree[0].requires[0].requires.length).to.equal(1)
	})

	it('generates flat list and tree for prod only', async () => {
		const inclusions = ['prod']
		const depsIndex = getDependencies(packageJson, [], inclusions, '')
		const { depsIndexRecursiveFlat, depsIndexRecursiveTree } = await addDependenciesRecursive(depsIndex, projectRootPath, [], inclusions, '')

		expect(depsIndex.length).to.equal(3)
		expect(depsIndexRecursiveFlat.length).to.equal(4)
		expect(depsIndexRecursiveTree.length).to.equal(3)
		expect(depsIndexRecursiveTree[0].fullName).to.equal('once')
		expect(depsIndexRecursiveTree[0].requires.length).to.equal(1)
		expect(depsIndexRecursiveTree[0].requires[0].fullName).to.equal('wrappy')
		expect(depsIndexRecursiveTree[0].requires[0].requires).to.be.undefined
	})

	it('generates flat list and tree for prod and opt only', async () => {
		const inclusions = ['prod', 'opt']
		const depsIndex = getDependencies(packageJson, [], inclusions, '')
		const { depsIndexRecursiveFlat, depsIndexRecursiveTree } = await addDependenciesRecursive(depsIndex, projectRootPath, [], inclusions, '')

		expect(depsIndex.length).to.equal(4)
		expect(depsIndexRecursiveFlat.length).to.equal(5)
		expect(depsIndexRecursiveTree.length).to.equal(4)
		expect(depsIndexRecursiveTree[0].fullName).to.equal('once')
		expect(depsIndexRecursiveTree[0].requires.length).to.equal(1)
		expect(depsIndexRecursiveTree[0].requires[0].fullName).to.equal('wrappy')
		expect(depsIndexRecursiveTree[0].requires[0].requires).to.be.undefined
	})

	it('generates flat list and tree for empty only definition', async () => {
		const inclusions = []
		const depsIndex = getDependencies(packageJson, [], inclusions, '')
		const { depsIndexRecursiveFlat, depsIndexRecursiveTree } = await addDependenciesRecursive(depsIndex, projectRootPath, [], inclusions, '')

		expect(depsIndex.length).to.equal(4)
		expect(depsIndexRecursiveFlat.length).to.equal(10)
		expect(depsIndexRecursiveTree.length).to.equal(4)
		expect(depsIndexRecursiveTree[0].fullName).to.equal('once')
		expect(depsIndexRecursiveTree[0].requires.length).to.equal(2)
		expect(depsIndexRecursiveTree[0].requires[0].fullName).to.equal('wrappy')
		expect(depsIndexRecursiveTree[0].requires[0].requires.length).to.equal(1)
	})

	it('generates flat list and tree with empty string in only definition', async () => {
		const inclusions = ['']
		const depsIndex = getDependencies(packageJson, [], inclusions)
		const { depsIndexRecursiveFlat, depsIndexRecursiveTree } = await addDependenciesRecursive(depsIndex, projectRootPath, [], inclusions)

		expect(depsIndex.length).to.equal(0)
		expect(depsIndexRecursiveFlat.length).to.equal(0)
		expect(depsIndexRecursiveTree.length).to.equal(0)
	})
});
