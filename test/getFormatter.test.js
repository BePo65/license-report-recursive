import assert from 'node:assert';
import { describe, it } from 'node:test';

import config from '../lib/config.js';
import getFormatter from '../lib/getFormatter.js';

describe('getFormatter', () => {
  describe('formatter for tree', () => {
    it('produces a report', () => {
      const jsonFormatter = getFormatter('tree');
      const jsonResult = jsonFormatter(testData, config);

      assert.strictEqual(jsonResult, EXPECTED_JSON_RESULT);
    });

    it('produces a report for an empty data array', () => {
      const jsonFormatter = getFormatter('tree');
      const jsonResult = jsonFormatter([], config);

      assert.strictEqual(jsonResult, '[]');
    });
  });
});

const testData = [
  {
    department: 'kessler',
    relatedTo: 'stuff',
    name: '@ungap/promise-all-settled',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'ISC',
    link: 'git+https://github.com/ungap/promise-all-settled.git',
    remoteVersion: '1.1.2',
    installedVersion: '1.1.2',
    definedVersion: '^1.1.2',
    author: 'Andrea Giammarchi',
  },
  {
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'once',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'ISC',
    link: 'git://github.com/isaacs/once.git',
    remoteVersion: '1.4.0',
    installedVersion: '1.4.0',
    definedVersion: '^1.4.0',
    author: 'Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)',
    requires: [
      {
        department: 'kessler',
        relatedTo: 'stuff',
        name: 'wrappy',
        licensePeriod: 'perpetual',
        material: 'material',
        licenseType: 'ISC',
        link: 'git+https://github.com/npm/wrappy.git',
        remoteVersion: '1.0.2',
        installedVersion: '1.0.2',
        definedVersion: '1',
        author: 'Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)',
      },
    ],
  },
];

const EXPECTED_JSON_RESULT =
  '[{"department":"kessler","relatedTo":"stuff","name":"@ungap/promise-all-settled","licensePeriod":"perpetual","material":"material","licenseType":"ISC","link":"git+https://github.com/ungap/promise-all-settled.git","remoteVersion":"1.1.2","installedVersion":"1.1.2","definedVersion":"^1.1.2","author":"Andrea Giammarchi"},{"department":"kessler","relatedTo":"stuff","name":"once","licensePeriod":"perpetual","material":"material","licenseType":"ISC","link":"git://github.com/isaacs/once.git","remoteVersion":"1.4.0","installedVersion":"1.4.0","definedVersion":"^1.4.0","author":"Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)","requires":[{"department":"kessler","relatedTo":"stuff","name":"wrappy","licensePeriod":"perpetual","material":"material","licenseType":"ISC","link":"git+https://github.com/npm/wrappy.git","remoteVersion":"1.0.2","installedVersion":"1.0.2","definedVersion":"1","author":"Isaac Z. Schlueter <i@izs.me> (http://blog.izs.me/)"}]}]';
