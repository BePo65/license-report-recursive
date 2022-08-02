// postinstall.js
// update the version of license-report in the README.md file

import fs from 'fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageLockJsonPath = path
	.resolve(__dirname, '..', 'package-lock.json')
	.replace(/(\s+)/g, '\\$1');

const readmePath = path
	.resolve(__dirname, '..', 'README.md')
	.replace(/(\s+)/g, '\\$1');

(async () => {
  const packageJsonAsBuffer = await fs.promises.readFile(packageLockJsonPath);
  const packageJson = JSON.parse(packageJsonAsBuffer.toString());

  let licenseReportVersion = packageJson.dependencies['license-report']?.version;
  if (!licenseReportVersion) {
    licenseReportVersion = '0.0.0'
  }

  const readmeContentAsBuffer = await fs.promises.readFile(readmePath);
  const readmeContentAsString = readmeContentAsBuffer.toString();
  const versionSearchPattern = /(.*https:\/\/img.shields.io\/badge\/license--report-)(.+)(-green\.svg.*)/is;
  const regexResult = readmeContentAsString.match(versionSearchPattern);
  let newReadmeContent = readmeContentAsString;
  if (regexResult?.length === 4) {
    newReadmeContent = [regexResult[1], licenseReportVersion, regexResult[3]].join('');
    await fs.promises.writeFile(readmePath, newReadmeContent);
  } else {
    console.error('Error: pattern in README.md not found.')
  }
})();