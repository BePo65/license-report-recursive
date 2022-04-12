// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');

const util = require('license-report/lib/util');

const addDependenciesRecursive = require('../lib/addDependenciesRecursive.js');
const getDepsIndex = require('../lib/getDepsIndex.js');

chai.use(chaiAsPromised);
const expect = chai.expect;

const packageJsonPath = path
	.resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package.json')
	.replace(/(\s+)/g, '\\$1')

	const packageLockJsonPath = path
	.resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package-lock.json')
	.replace(/(\s+)/g, '\\$1')	

describe('addDependenciesRecursive', () => {
	let packageJson
	let packageLockJson

	beforeEach(async () => {
		packageJson = await util.readJson(packageJsonPath)
		packageLockJson = await util.readJson(packageLockJsonPath)
	})

	it('does add packages with same name, but different version expressions', () => {
		const depsIndex = getDepsIndex(packageJson)
		const depsIndexActive = addDependenciesRecursive(depsIndex, packageLockJson)
		const duplicatePackage = depsIndexActive.filter(package => package.fullName === 'lowercase-keys')

		expect(depsIndex.length).to.equal(1)
		expect(depsIndexActive.length).to.equal(33)
		expect(duplicatePackage.length).to.equal(2)
	})
});
