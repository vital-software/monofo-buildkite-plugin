`monofo base-commit`
====================

output a base commit hash, against which the current build would be compared

* [`monofo base-commit`](#monofo-base-commit)

## `monofo base-commit`

output a base commit hash, against which the current build would be compared

```
USAGE
  $ monofo base-commit

OPTIONS
  -C, --chdir=chdir  Directory to change to before executing command
  -V, --version      show CLI version
  -h, --help         Show this help message
  -v, --verbose      Run with verbose logging

EXAMPLE
  $ monofo base-commit
  6c4fe0eda8b93de6764c3f99758505f0e4370103
```

_See code: [dist/src/commands/base-commit.ts](https://github.com/vital-software/monofo/blob/v3.1.4/dist/src/commands/base-commit.ts)_
