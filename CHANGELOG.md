# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [6.1.2](https://github.com/bepo65/license-report-recursive/compare/v6.1.1...v6.1.2) (2022-11-15)


### Bug Fixes

* set correct package name in bin entry of package.json ([e50d52a](https://github.com/bepo65/license-report-recursive/commit/e50d52aa8833c7a92dfc823e24dd8bd7bd4f9aaf))

### [6.1.1](https://github.com/bepo65/license-report-recursive/compare/v6.1.0...v6.1.1) (2022-10-28)

## [6.1.0](https://github.com/bepo65/license-report-recursive/compare/v6.0.0...v6.1.0) (2022-09-01)


### Features

* update to license-report 6.1.0 - add new fields ([7cde713](https://github.com/bepo65/license-report-recursive/commit/7cde71322b2942c53283e5d8b0cbe76789178244))
  + 'latestRemoteVersion' for the latest version available in the registry,
  + 'latestRemoteModified' for finding out, if package is still maintained.

## [6.0.0](https://github.com/bepo65/license-report-recursive/compare/v1.0.1...v6.0.0) (2022-08-03)


### ⚠ BREAKING CHANGES

* switched project to ECMAScript modules
required by license-report v6.0.0.
devDependencies are ignored on nested packages (as these are not
required when using a package in another package).

### Features

* update project to license-report v6.0 based on esm ([766451d](https://github.com/bepo65/license-report-recursive/commit/766451df50814fe48a40ff0db2a5da70b90721de))

### [1.0.1](https://github.com/bepo65/license-report-recursive/compare/v1.0.0...v1.0.1) (2022-05-01)

## 1.0.0 (2022-04-13)
