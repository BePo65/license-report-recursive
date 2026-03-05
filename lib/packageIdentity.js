/**
 * Builds a stable package token used in dependency paths and identifiers.
 * Prefer fullName because it keeps npm scope information (e.g. @scope/pkg).
 * @param {object} pkg - dependency object
 * @returns {string} package token
 */
const getPackageToken = (pkg) => {
  if (pkg?.fullName) {
    return pkg.fullName;
  }

  if (pkg?.scope && pkg?.name) {
    return `@${pkg.scope}/${pkg.name}`;
  }

  return pkg?.name ?? '';
};

/**
 * Builds a stable package id including the installed version.
 * @param {object} pkg - dependency object
 * @returns {string} package id
 */
const getPackageId = (pkg) => {
  return `${getPackageToken(pkg)}@${pkg?.installedVersion ?? ''}`;
};

export { getPackageId, getPackageToken };
