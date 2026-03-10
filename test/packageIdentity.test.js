import assert from 'node:assert';
import { describe, it } from 'node:test';

import { getPackageId, getPackageIdWithVersion } from '../lib/packageIdentity.js';

describe('packageIdentity', () => {
  it('uses fullName as package id when available', () => {
    const pkg = {
      fullName: '@scope/pkg',
      name: 'pkg',
      scope: 'scope',
    };

    assert.equal(getPackageId(pkg), '@scope/pkg');
  });

  it('builds package ids with version without scope collisions', () => {
    const packageA = {
      fullName: '@scope-a/core',
      name: 'core',
      installedVersion: '1.2.3',
    };
    const packageB = {
      fullName: '@scope-b/core',
      name: 'core',
      installedVersion: '1.2.3',
    };

    assert.notEqual(getPackageIdWithVersion(packageA), getPackageIdWithVersion(packageB));
    assert.equal(getPackageIdWithVersion(packageA), '@scope-a/core@1.2.3');
    assert.equal(getPackageIdWithVersion(packageB), '@scope-b/core@1.2.3');
  });
});
