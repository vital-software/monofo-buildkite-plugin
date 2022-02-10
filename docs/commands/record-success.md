`monofo record-success`
=======================

Record success of a component of the build, so that we can skip it next time if possible

* [`monofo record-success COMPONENTNAME CONTENTHASH`](#monofo-record-success-componentname-contenthash)

## `monofo record-success COMPONENTNAME CONTENTHASH`

Record success of a component of the build, so that we can skip it next time if possible

```
USAGE
  $ monofo record-success [COMPONENTNAME] [CONTENTHASH] [-C <value>] [-v] [-V] [-h]

ARGUMENTS
  COMPONENTNAME  Name of the component that was successful
  CONTENTHASH    Content hash (SHA256) of the matching files for this successful component

FLAGS
  -C, --chdir=<value>  Directory to change to before executing command
  -V, --version        Show CLI version.
  -h, --help           Show this help message
  -v, --verbose        Run with verbose logging

DESCRIPTION
  Record success of a component of the build, so that we can skip it next time if possible
```

_See code: [dist/src/commands/record-success.ts](https://github.com/vital-software/monofo/blob/v5.0.1/dist/src/commands/record-success.ts)_
