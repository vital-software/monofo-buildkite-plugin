`monofo record-success`
=======================

Record success of a component of the build, so that we can skip it next time if possible

* [`monofo record-success COMPONENTNAME CONTENTHASH`](#monofo-record-success-componentname-contenthash)

## `monofo record-success COMPONENTNAME CONTENTHASH`

Record success of a component of the build, so that we can skip it next time if possible

```
USAGE
  $ monofo record-success COMPONENTNAME CONTENTHASH

ARGUMENTS
  COMPONENTNAME  Name of the component that was successful
  CONTENTHASH    Content hash (SHA256) of the matching files for this successful component

OPTIONS
  -C, --chdir=chdir  Directory to change to before executing command
  -V, --version      show CLI version
  -h, --help         Show this help message
  -v, --verbose      Run with verbose logging
```

_See code: [dist/src/commands/record-success.ts](https://github.com/vital-software/monofo/blob/v3.5.3/dist/src/commands/record-success.ts)_
