import assert from 'node:assert';
import { describe, it } from 'node:test';

import { getPackageId, getPackageToken } from '../lib/packageIdentity.js';

describe('packageIdentity', () => {
  it('uses fullName as package token when available', () => {
    const pkg = {
      fullName: '@scope/pkg',
      name: 'pkg',
      scope: 'scope',
    };

    assert.equal(getPackageToken(pkg), '@scope/pkg');
  });

  it('builds package ids without scope collisions', () => {
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

    assert.notEqual(getPackageId(packageA), getPackageId(packageB));
    assert.equal(getPackageId(packageA), '@scope-a/core@1.2.3');
    assert.equal(getPackageId(packageB), '@scope-b/core@1.2.3');
  });
});
