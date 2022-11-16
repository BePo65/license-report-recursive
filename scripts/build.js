#!/usr/bin/env node

// build.js
// copy files to 'dist' directory for publishing the application

import path from 'node:path';
import url from 'node:url';
import fse from 'fs-extra';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const targetDirPath = path
.resolve(__dirname, '..', 'dist')
.replace(/(\s+)/g, '\\$1');

const packageJsonPath = path
	.resolve(__dirname, '..', 'package.json')
	.replace(/(\s+)/g, '\\$1');

(async () => {
  await fse.ensureDir(targetDirPath);
  await fse.emptyDir(targetDirPath);

  fse.copySync('index.js', 'dist/index.js');
  fse.copySync('lib', 'dist/lib');
  fse.copySync('README.md', 'dist/README.md');
  fse.copySync('LICENSE', 'dist/LICENSE');
  fse.copySync('CHANGELOG.md', 'dist/CHANGELOG.md');

  const packageJson = await fse.readJson(packageJsonPath);
  delete packageJson.scripts;
  await fse.writeJson('dist/package.json', packageJson, {spaces: 2});

  console.log('build finished.')
})();
