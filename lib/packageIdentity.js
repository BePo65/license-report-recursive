/**
 * Builds a stable package id used in dependency paths and comparisons.
 * Prefer fullName because it keeps npm scope information (e.g. @scope/pkg).
 * @param {object} pkg - dependency object
 * @returns {string} package id
 */
const getPackageId = (pkg) => {
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
 * @returns {string} package id with installed version
 */
const getPackageIdWithVersion = (pkg) => {
  return `${getPackageId(pkg)}@${pkg?.installedVersion ?? ''}`;
};

export { getPackageId, getPackageIdWithVersion };
