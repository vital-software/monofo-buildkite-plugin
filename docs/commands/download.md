`monofo download`
=================

Downloads the given list of artifacts, inflating them if they are suitable archives

Receives a list of references to files

We support two special cases:
  - if .tar.caidx, we inflate the artifact from desync, and extract in-place
  - if .tar.lz4, we inflate the artifact using lz4, and extract in-place

In both cases, we don't support a "from/to" style configuration, only a list. For each artifact, we support three
modifiers passed in env vars:

  - MONOFO_ARTIFACT_<NAME>_SOFT_FAIL=0|1
  - MONOFO_ARTIFACT_<NAME>_SKIP=0|1
  - MONOFO_ARTIFACT_<NAME>_BUILD_ID=<build UUID>

* [`monofo monofo download <artifacts...>`](#monofo-monofo-download-artifacts)

## `monofo monofo download <artifacts...>`

Downloads the given list of artifacts, inflating them if they are suitable archives

```
USAGE
  $ monofo monofo download <artifacts...>

ARGUMENTS
  ARTIFACTS  A list of artifact files to retrieve and extract

OPTIONS
  -C, --chdir=chdir  Directory to change to before executing command
  -V, --version      show CLI version
  -h, --help         Show this help message
  -v, --verbose      Run with verbose logging

DESCRIPTION
  Receives a list of references to files

  We support two special cases:
    - if .tar.caidx, we inflate the artifact from desync, and extract in-place
    - if .tar.lz4, we inflate the artifact using lz4, and extract in-place

  In both cases, we don't support a "from/to" style configuration, only a list. For each artifact, we support three
  modifiers passed in env vars:

    - MONOFO_ARTIFACT_<NAME>_SOFT_FAIL=0|1
    - MONOFO_ARTIFACT_<NAME>_SKIP=0|1
    - MONOFO_ARTIFACT_<NAME>_BUILD_ID=<build UUID>
```

_See code: [dist/src/commands/download.ts](https://github.com/vital-software/monofo/blob/v3.1.1/dist/src/commands/download.ts)_
