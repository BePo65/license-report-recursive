import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import url from 'node:url';
import util from '../lib/util.js';
import {
  addRemoteVersionsToExpectedData,
  rawDataToCsv,
  rawDataToTable,
} from './fixture/expectedOutput.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const scriptPath = path.resolve(__dirname, '..', 'index.js').replace(/(\s+)/g, '\\$1');

// test data for e2e test
const e2ePackageJsonPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'package.json')
  .replace(/(\s+)/g, '\\$1');

const e2eExpectedDataDefaultFieldsFlatPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'expectedDataDefaultFields.flat.json')
  .replace(/(\s+)/g, '\\$1');

const e2eExpectedDataDefaultFieldsTreePath = path
  .resolve(__dirname, 'fixture', 'e2e', 'expectedDataDefaultFields.tree.json')
  .replace(/(\s+)/g, '\\$1');

const e2eExpectedDataAllFieldsPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'expectedDataAllFields.json')
  .replace(/(\s+)/g, '\\$1');
const allFieldsConfigPath = path
  .resolve(__dirname, 'fixture', 'e2e', 'configAllFields.json')
  .replace(/(\s+)/g, '\\$1');

// test data for dependencyLoop test
const loopPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'e2e.loop', 'package.json')
  .replace(/(\s+)/g, '\\$1');

const loopExpectedDataPath = path
  .resolve(__dirname, 'fixture', 'e2e.loop', 'expectedData.json')
  .replace(/(\s+)/g, '\\$1');

describe('end to end test', { timeout: 100000 }, () => {
  it('produce a csv report with default fields', async () => {
    const expectedDataBase = await util.readJson(e2eExpectedDataDefaultFieldsFlatPath);
    await addRemoteVersionsToExpectedData(expectedDataBase);
    const expectedCsvResult = rawDataToCsv(expectedDataBase, EXPECTED_CSV_TEMPLATE);

    const actualCsvResult = execFileSync(
      'node',
      [scriptPath, `--package=${e2ePackageJsonPath}`, '--output=csv', '--csvHeaders'],
      { encoding: 'utf8' },
    );

    assert.strictEqual(actualCsvResult, expectedCsvResult);
  });

  it('produce a table report with default fields', async () => {
    const expectedDataBase = await util.readJson(e2eExpectedDataDefaultFieldsFlatPath);
    await addRemoteVersionsToExpectedData(expectedDataBase);
    const expectedTableResult = rawDataToTable(expectedDataBase, EXPECTED_TABLE_TEMPLATE);

    const actualTableResult = execFileSync(
      'node',
      [scriptPath, `--package=${e2ePackageJsonPath}`, '--output=table', '--csvHeaders'],
      { encoding: 'utf8' },
    );

    assert.strictEqual(actualTableResult, expectedTableResult);
  });

  it('produce a tree report with default fields', async () => {
    const expectedData = await util.readJson(e2eExpectedDataDefaultFieldsTreePath);
    await addRemoteVersionsToExpectedData(expectedData);

    const result = execFileSync('node', [
      scriptPath,
      `--package=${e2ePackageJsonPath}`,
      '--output=tree',
    ]);
    const resultJson = JSON.parse(result);

    assert.deepStrictEqual(resultJson, expectedData);
  });

  it('produce a tree report with all fields', async () => {
    const expectedData = await util.readJson(e2eExpectedDataAllFieldsPath);
    await addRemoteVersionsToExpectedData(expectedData);

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
    const expectedData = await util.readJson(loopExpectedDataPath);
    await addRemoteVersionsToExpectedData(expectedData);

    const result = execFileSync('node', [
      scriptPath,
      `--package=${loopPackageJsonPath}`,
      '--output=tree',
    ]);
    const resultJson = JSON.parse(result);

    assert.deepStrictEqual(resultJson, expectedData);
  });
});

/*
	template for csv output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_CSV_TEMPLATE = `department,related to,name,alias,license period,material / not material,license type,link,defined version,installed version,remote version,author
{{department}},{{relatedTo}},[[@kessler/tableify]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
{{department}},{{relatedTo}},[[@ungap/promise-all-settled]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
{{department}},{{relatedTo}},[[lodash]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
{{department}},{{relatedTo}},[[lru-cache]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
{{department}},{{relatedTo}},[[semver]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
{{department}},{{relatedTo}},[[yallist]],{{alias}},{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{definedVersion}},{{installedVersion}},{{remoteVersion}},{{author}}
`;

/*
	template for table output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_TABLE_TEMPLATE = `{{department}}  {{relatedTo}}  {{name}}  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  {{name}}  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[@kessler/tableify]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[@ungap/promise-all-settled]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[lodash]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[lru-cache]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[semver]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[yallist]]  {{alias}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{definedVersion}}  {{installedVersion}}  {{remoteVersion}}  {{author}}
`;
