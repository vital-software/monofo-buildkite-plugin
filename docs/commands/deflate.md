`monofo deflate`
================

deflate a tar resource into a given artifact name

* [`monofo deflate TARFILE OUTPUT`](#monofo-deflate-tarfile-output)

## `monofo deflate TARFILE OUTPUT`

deflate a tar resource into a given artifact name

```
USAGE
  $ monofo deflate TARFILE OUTPUT

ARGUMENTS
  TARFILE  Path to a .tar file
  OUTPUT   Path to a target deflated artifact file, like something.tar.gz or something.caidx

OPTIONS
  -C, --chdir=chdir  Directory to change to before executing command
  -V, --version      show CLI version
  -h, --help         Show this help message
  -v, --verbose      Run with verbose logging
```

_See code: [dist/src/commands/deflate.ts](https://github.com/vital-software/monofo/blob/v3.5.3/dist/src/commands/deflate.ts)_
