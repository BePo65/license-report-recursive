# license report tool with recursion

![Version](https://img.shields.io/badge/version-6.7.2-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/kefranabg/readme-md-generator/blob/master/LICENSE)
based on <a href="https://www.npmjs.com/package/license-report"><img src="https://img.shields.io/badge/license--report-6.7.2-green.svg"/></a>

> Generate a license report of the projects dependencies, optionally with recursion.

Extends the [license-report](https://github.com/ironSource/license-report) tool. The documentation for license-report is valid for this tool too. Changes can be found below.

## Usage

### Enable recursion:

```
cd your/project/
license-report-recursive --recurse
```

### Generate json tree output:

```
license-report-recursive --recurse --output=tree
```

### General notes

- As this program iterates over all dependencies and the dependencies of the dependencies, it will take quite a while to finish when used on non-trivial projects (**may take several minutes to finish!**).
- The program looks for packages in nested node_modules directories. If more than 1 version is installed (in different nesting levels), all installed versions are reported.
- The program adds the field 'alias' to the configuration and uses it in the default field list. 'alias' is the alias name of a dependency (for more details see the 'npm-install' documentation; an example is 'babel-register > babel-core > babel-register').
- The program adds the field 'dependencyLoop' to the configuration (not used it in the default field list). 'dependencyLoop' is true, if this package is part of a dependency loop (i.e. dependency is indirectly a dependant of itself).  
  In case of dependency loops, the 'requires' field of the package, resulting in a dependency loop, contains an entry with 'dependencyLoop: true'.

## Show detailed progress during report generation (Debug information)

By setting the debug environment variable as follows, detailed log information is generated during the report generation and send to the stderr output stream. The reported information includes the nesting level and the currently processed package.

For more information see the documentation of the debug package on npm.

```bash
export DEBUG=license-report-recurse
```

or for windows environment

```bash
set DEBUG=license-report-recurse
```

## Changelog

For list of changes and bugfixes, see [CHANGELOG.md](CHANGELOG.md).

## Contributing

The [CHANGELOG.md](CHANGELOG.md) is generated with `standard-changelog` (using the command `npm run release`).

To make this possible the commit messages must follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#specification).

```
<type>: <description>

<optional body>
```

The following is the list of supported types of commit messages:

- build: changes that affect build components like build tool, ci pipeline, dependencies, project version, etc...
- chore: changes that aren't user-facing (e.g. merging branches).
- docs: changes that affect the documentation.
- feat: changes that introduce a new feature.
- fix: changes that patch a bug.
- perf: changes which improve performance.
- refactor: changes which neither fix a bug nor add a feature.
- revert: changes that revert a previous commit.
- style: changes that don't affect code logic, such as white-spaces, formatting, missing semi-colons.
- test: changes that add missing tests or correct existing tests.

To ensure the syntax of commit messages `commitlint` is used, triggered by `husky`. This feature must be activated with `npm run activate-commitlint` once for every local clone of `license-report`.

## License

Copyright © 2024 [Bernhard Pottler](https://github.com/BePo65).

Distributed under the MIT License. See `LICENSE` for more information.
