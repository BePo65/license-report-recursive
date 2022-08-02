# license report tool with recursion
![Version](https://img.shields.io/badge/version-1.0.1-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/kefranabg/readme-md-generator/blob/master/LICENSE)
based on <a href="https://www.npmjs.com/package/license-report"><img src="https://img.shields.io/badge/license--report-6.0.0-green.svg"/></a>

> Generate a license report of the projects dependencies, optionally with recursion.

Based on the [license-report](https://github.com/ironSource/license-report). The documentation for license-report is valid for this tool too. Changes can be found below.

## Usage
### Enable recursion:
```
cd your/project/
license-report --recurse
```

### Generate json tree output:
```
license-report --recurse --output=tree
```

### Open issues
* the program does not look for packages in nested node_modules directories. Therefore only 1 version of a package is evaluated.

## Changelog
For list of changes and bugfixes, see [CHANGELOG.md](CHANGELOG.md).

## Contributing
The [CHANGELOG.md](CHANGELOG.md) is generated with `standard-changelog` (using the command `npm run release`).

To make this possible the commit messages must follow the [conventinal commits specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#specification).

```
<type>: <description>

<optional body>
```

The following is the list of supported types:
* build: changes that affect build components like build tool, ci pipeline, dependencies, project version, etc...
* chore: changes that aren't user-facing (e.g. merging branches).
* docs: changes that affect the documentation.
* feat: changes that introduce a new feature.
* fix: changes that patch a bug.
* perf: changes which improve performance.
* refactor: changes which neither fix a bug nor add a feature.
* revert: changes that revert a previous commit.
* style: changes that don't affect code logic, such as white-spaces, formatting, missing semi-colons.
* test: changes that add missing tests or correct existing tests.

To ensure the syntax of commit messages `commitlint` is used, triggered by `husky`. This feature must be activated with `npm run activate-commitlint` once for every local clone of `license-report`.
