`monofo upload`
===============

Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts

* [`monofo monofo upload <output> [globs...]`](#monofo-monofo-upload-output-globs)

## `monofo monofo upload <output> [globs...]`

Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts

```
USAGE
  $ monofo monofo upload <output> [globs...]

ARGUMENTS
  OUTPUT  The output file to produce (foo.tar.lz4 or bar.tar.caidx, etc.)
  GLOBS   [default: ] A list of glob patterns; matching files are included in the artifact upload

OPTIONS
  -C, --chdir=chdir            Directory to change to before executing command
  -F, --files-from=files-from  A path to a file containing a list of files to upload, or - to use stdin
  -V, --version                show CLI version
  -h, --help                   Show this help message
  -v, --verbose                Run with verbose logging
  -z, --null                   If given, the list of files is expected to be null-separated (a la find's -print0)
```

_See code: [dist/src/commands/upload.ts](https://github.com/vital-software/monofo/blob/v3.1.1/dist/src/commands/upload.ts)_
