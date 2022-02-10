`monofo base-commit`
====================

output a base commit hash, against which the current build would be compared

* [`monofo base-commit`](#monofo-base-commit)

## `monofo base-commit`

output a base commit hash, against which the current build would be compared

```
USAGE
  $ monofo base-commit [-C <value>] [-v] [-V] [-h]

FLAGS
  -C, --chdir=<value>  Directory to change to before executing command
  -V, --version        Show CLI version.
  -h, --help           Show this help message
  -v, --verbose        Run with verbose logging

DESCRIPTION
  output a base commit hash, against which the current build would be compared

EXAMPLES
  $ monofo base-commit
  6c4fe0eda8b93de6764c3f99758505f0e4370103
```

_See code: [dist/src/commands/base-commit.ts](https://github.com/vital-software/monofo/blob/v5.0.1/dist/src/commands/base-commit.ts)_
