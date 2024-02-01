// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import { expect } from 'chai';
import path from 'node:path';
import url from 'node:url';

import getDependencies from '../lib/getDependencies.js';
import util from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path
	.resolve(__dirname, 'fixture', 'addDependenciesRecursive', 'package.json')
	.replace(/(\s+)/g, '\\$1')

describe('getDependencies', () => {
	let packageJson

	beforeEach(async () => {
		packageJson = await util.readJson(packageJsonPath)
	})

	it('adds all dependency types to output (no "depsType" parameter)', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions)

		expect(depsIndex.length).to.equal(4)
	})

	it('adds all dependency types to output (empty "depsType" parameter)', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions, [])

		expect(depsIndex.length).to.equal(4)
	})

	it('adds dependencies to output', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions, ['prod'])

		expect(depsIndex.length).to.equal(3)
	})

	it('adds optionalDependencies to output', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions, ['opt'])

		expect(depsIndex.length).to.equal(1)
	})

	it('adds dependencies and optionalDependencies to output', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions, ['prod', 'opt'])

		expect(depsIndex.length).to.equal(4)
	})

	it('adds peerDependencies to output', () => {
		const exclusions = []
    let depsIndex = getDependencies(packageJson, exclusions, ['peer'])

		expect(depsIndex.length).to.equal(0)
	})
});
