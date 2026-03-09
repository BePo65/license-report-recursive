import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import url from 'node:url';
import util from '../lib/util.js';
import expectedOutput from './fixture/expectedOutput.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const scriptPath = path.resolve(__dirname, '..', 'index.js').replace(/(\s+)/g, '\\$1');

// test data for e2e test
const e2ePackageJsonPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'package.json')
  .replace(/(\s+)/g, '\\$1');

const e2eExpectedDataDefaultFieldsPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'expectedDataDefaultFields.json')
  .replace(/(\s+)/g, '\\$1');

const e2eExpectedDataAllFieldsPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'expectedDataAllFields.json')
  .replace(/(\s+)/g, '\\$1');
const allFieldsConfigPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'configAllFields.json')
  .replace(/(\s+)/g, '\\$1');

// test data for dependencyLoop test
const loopPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencyLoop', 'package.json')
  .replace(/(\s+)/g, '\\$1');

const loopExpectedDataPath = path
  .resolve(__dirname, 'fixture', 'dependencyLoop', 'expectedData.json')
  .replace(/(\s+)/g, '\\$1');

let expectedData;

describe('end to end test', { timeout: 100000 }, () => {
  it('produce a tree report for default fields', async () => {
    expectedData = await util.readJson(e2eExpectedDataDefaultFieldsPath);
    await expectedOutput.addRemoteVersionsToExpectedData(expectedData);

    const result = execFileSync('node', [
      scriptPath,
      `--package=${e2ePackageJsonPath}`,
      '--output=tree',
    ]);
    const resultJson = JSON.parse(result);

    assert.deepStrictEqual(resultJson, expectedData);
  });

  it('produce a tree report with all fields', async () => {
    expectedData = await util.readJson(e2eExpectedDataAllFieldsPath);
    await expectedOutput.addRemoteVersionsToExpectedData(expectedData);

    const result = execFileSync('node', [
      scriptPath,
      `--package=${e2ePackageJsonPath}`,
      `--config=${allFieldsConfigPath}`,
      '--output=tree',
    ]);
    const resultJson = JSON.parse(result);

    assert.deepStrictEqual(resultJson, expectedData);
  });

  it('produce a tree report for project with dependency loops', async () => {
    expectedData = await util.readJson(loopExpectedDataPath);
    await expectedOutput.addRemoteVersionsToExpectedData(expectedData);

    const result = execFileSync('node', [
      scriptPath,
      `--package=${loopPackageJsonPath}`,
      '--output=tree',
    ]);
    const resultJson = JSON.parse(result);

    assert.deepStrictEqual(resultJson, expectedData);
  });
});
