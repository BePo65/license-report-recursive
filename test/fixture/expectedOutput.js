import path from 'node:path';

import got from 'got';
import semver from 'semver';
import createDebugMessages from 'debug';

import config from '../../lib/config.js';
import { joinUrlPath } from 'license-report/lib/util.js';

const debug = createDebugMessages('license-report-recursive:expectedOutput');

/**
 * Get the latest version from registry and add it to the entry in the expectedData;
 * the field 'definedVersion' in the packagesData entries must contain the
 * package name with the range character from the package.json to find the
 * latest version satisfying the defined range (the range character will be
 * removed later)
 * @param {object} dependency - object with expected data containing placeholders for remote versions
 */
async function addRemoteVersion(dependency) {
  let uri = joinUrlPath(config.registry, dependency.name);

  debug('addRemoteVersion - REQUEST %s', uri);

  const options = {
    retry: config.httpRetryOptions,
    timeout: config.httpTimeoutOptions,
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (options, error, retryCount) => {
          debug(
            `http request to npm for package "${dependency.name}" failed, retrying again soon...`,
          );
        },
      ],
      beforeError: [
        (error) => {
          debug(error);
          return error;
        },
      ],
    },
  };
  let packagesJson = {};

  try {
    packagesJson = await got(uri, options).json();
  } catch (error) {
    packagesJson.error = `http request to npm for package "${dependency.name}" failed with error '${error}'`;
  }

  // 'remoteVersion': find the right version for this package
  if (dependency.remoteVersion !== undefined) {
    dependency.remoteVersion = 'n/a';
    if (packagesJson.versions) {
      const versions = Object.keys(packagesJson.versions);
      const version = semver.maxSatisfying(versions, dependency.definedVersion);
      if (version) {
        dependency.remoteVersion = version.toString();
      }
    }
  }

  // latestRemoteVersion
  if (dependency.latestRemoteVersion !== undefined) {
    dependency.latestRemoteVersion = 'n/a';
    if (
      packagesJson['dist-tags'] !== undefined &&
      packagesJson['dist-tags'].latest !== undefined
    ) {
      dependency.latestRemoteVersion = packagesJson['dist-tags'].latest;
    }
  }

  // latestRemoteModified
  if (dependency.latestRemoteModified !== undefined) {
    dependency.latestRemoteModified = 'n/a';
    if (
      packagesJson.time !== undefined &&
      packagesJson.time.modified !== undefined
    ) {
      dependency.latestRemoteModified = packagesJson.time.modified;
    }
  }
}

/**
 * Recursively add remoteVersion to objects in array of expectedData
 * @param {[object]} expectedData - array with expected data objects containing placeholders for remote versions
 */
async function addRemoteVersionsToExpectedData(expectedData) {
  for (const packageData of expectedData) {
    await addRemoteVersion(packageData);
    if (packageData.requires !== undefined) {
      await addRemoteVersionsToExpectedData(packageData.requires);
    }
  }
}

export default {
  addRemoteVersionsToExpectedData,
};
