`monofo deflate`
================

deflate a tar resource into a given artifact name

* [`monofo deflate TARFILE OUTPUT`](#monofo-deflate-tarfile-output)

## `monofo deflate TARFILE OUTPUT`

deflate a tar resource into a given artifact name

```
USAGE
  $ monofo deflate [TARFILE] [OUTPUT] [-C <value>] [-v] [-V] [-h]

ARGUMENTS
  TARFILE  Path to a .tar file
  OUTPUT   Path to a target deflated artifact file, like something.tar.gz or something.catar.caibx

FLAGS
  -C, --chdir=<value>  Directory to change to before executing command
  -V, --version        Show CLI version.
  -h, --help           Show this help message
  -v, --verbose        Run with verbose logging

DESCRIPTION
  deflate a tar resource into a given artifact name
```

_See code: [dist/src/commands/deflate.ts](https://github.com/vital-software/monofo/blob/v5.0.1/dist/src/commands/deflate.ts)_
