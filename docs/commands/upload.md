`monofo upload`
===============

Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts

This command has similar input modes to GNU tar. Meaning, it can take:
- a list of glob patterns, matching files and directories will be included in
   the artifact, and/or
- a path to a file containing a list of files to include in the artifact
  - which can be '-' for stdin
  - or can be null-separated (like the output mode of `find`'s `-print0` option)

Then this command is designed to stream things to the eventual destination,
process any necessary deflation of the resulting tar archive, and ensure it's
locally cached

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

DESCRIPTION
  This command has similar input modes to GNU tar. Meaning, it can take:
  - a list of glob patterns, matching files and directories will be included in
     the artifact, and/or
  - a path to a file containing a list of files to include in the artifact
    - which can be '-' for stdin
    - or can be null-separated (like the output mode of `find`'s `-print0` option)

  Then this command is designed to stream things to the eventual destination,
  process any necessary deflation of the resulting tar archive, and ensure it's
  locally cached

EXAMPLE
  $ find . -name node_modules -type d -prune -print0 | monofo upload --files-from - --null
```

_See code: [dist/src/commands/upload.ts](https://github.com/vital-software/monofo/blob/v3.1.1/dist/src/commands/upload.ts)_
