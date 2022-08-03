import path from 'node:path';

import got from 'got';
import semver from 'semver';
import createDebugMessages from 'debug';

import config from '../../lib/config.js';

const debug = createDebugMessages('license-report-recursive:expectedOutput');

/*
	get latest version from registry and add it to the entry in the expectedData;
	the field 'definedVersion' in the packagesData entries must contain the
	package name with the range character from the package.json to find the
	latest version satisfying the defined range (the range character will be
	removed later)
*/
async function addRemoteVersion(dependency) {
	dependency.remoteVersion = 'n/a'
	let uri = path.join(config.registry, dependency.name)

	debug('addRemoteVersion - REQUEST %s', uri)

	const options = {
		retry: config.httpRetryOptions,
		timeout: config.httpTimeoutOptions,
		hooks: {
			beforeRetry: [
				(options, error, retryCount) => {
					debug(`http request to npm for package "${dependency.name}" failed, retrying again soon...`)
				}
			],
			beforeError: [
				error => {
					debug(error)
					return error
				}
			]
		}
	}
	let packagesJson = {}

	try {
		packagesJson = await got(uri, options).json()
	} catch (error) {
		packagesJson.error = `http request to npm for package "${dependency.name}" failed with error '${error}'`
	}

	// find the right version for this package
	if(packagesJson.versions) {
		const versions = Object.keys(packagesJson.versions)
		const version = semver.maxSatisfying(versions, dependency.definedVersion)
		if (version) {
			dependency.remoteVersion = version.toString()
		}
	}
}

/**
 * Add remoteVersion to objects in array of expectedData
 * @param {[object]} expectedData - array with expected data containing placeholders for remote versions
 */
async function addRemoteVersionsToExpectedData(expectedData) {
	await Promise.all(expectedData.map(async (packageData) => {
		await addRemoteVersion(packageData)
	}))
}

export default {
	addRemoteVersionsToExpectedData
}
