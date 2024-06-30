# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [6.4.6](https://github.com/bepo65/license-report-recursive/compare/v6.4.5...v6.4.6) (2024-06-30)


### Bug Fixes

* set license-report version number ín readme when releasing ([350c73d](https://github.com/bepo65/license-report-recursive/commit/350c73de7220a455de961870326032766cf49cf5))

## [6.4.5](https://github.com/bepo65/license-report-recursive/compare/v6.4.4...v6.4.5) (2024-06-22)

## [6.4.4](https://github.com/bepo65/license-report-recursive/compare/v6.4.3...v6.4.4) (2024-06-22)

## [6.4.3](https://github.com/bepo65/license-report-recursive/compare/v6.4.2...v6.4.3) (2024-06-05)

## [6.4.2](https://github.com/bepo65/license-report-recursive/compare/v6.4.1...v6.4.2) (2024-03-02)

### [6.4.1](https://github.com/bepo65/license-report-recursive/compare/v6.4.0...v6.4.1) (2023-04-28)


### Bug Fixes

* issue [#27](https://github.com/bepo65/license-report-recursive/issues/27) (throw when parsing indirect dependencies) ([dde6dc8](https://github.com/bepo65/license-report-recursive/commit/dde6dc8ae9bcb6fad49b9665f6abe3954b335e9c))

## [6.4.0](https://github.com/bepo65/license-report-recursive/compare/v6.2.0...v6.4.0) (2023-04-26)

* make program use 'license-report' version 6.4.0

## [6.2.0](https://github.com/bepo65/license-report-recursive/compare/v6.1.3...v6.2.0) (2022-12-30)


### Features

* add field 'alias' to list of possible fields and to default output ([83f378e](https://github.com/bepo65/license-report-recursive/commit/83f378e9bbf3a9f4fa9b6cc1c160f9220295184c))
* add field 'dependencyLoop' to list of possible fields ([af4735d](https://github.com/bepo65/license-report-recursive/commit/af4735db291ea88b3eec4f29676ce07d063e4ccf))
* add tree generation with loops instead of recursion ([51ae914](https://github.com/bepo65/license-report-recursive/commit/51ae91431acf98fffd3ecc4d617a90248ff7e2f4))


### Bug Fixes

* refactor recursion to loops; tree output not yet functional! ([83c5eb2](https://github.com/bepo65/license-report-recursive/commit/83c5eb23ac9f6f556807fd73b690942c2b70908b))
* sort list by name and installedVersion ([85d8ad7](https://github.com/bepo65/license-report-recursive/commit/85d8ad7c8745e91c9897380feab67c33f1bd93c9))

### [6.1.3](https://github.com/bepo65/license-report-recursive/compare/v6.1.2...v6.1.3) (2022-11-16)

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
