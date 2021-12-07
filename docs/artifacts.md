# Artifact Caching

Monofo provides a locally cached artifact download/upload utility. This
functionality is accessed by using monofo as a Buildkite plugin from your steps.

This functionality is particularly optimized for producing and using compressed
tarballs to collect and cache very large numbers of files
(e.g. `node-modules.tar.lz4`). If you only need to upload/download a few files,
you might find it easier to use the standard
[artifacts plugin](https://github.com/buildkite-plugins/artifacts-buildkite-plugin).

## Uploads

The `upload` subcommand takes a target artifact output file name, like 
`node-modules.tar.lz4`. The artifact filename will determine what sort of 
compressed archive is produced.

The `upload` subcommand also needs a list of files to include in the archive.
This list can be passed using:
 - a list of glob expressions, or
 - a file containing a list of paths to include

Passing `-` as the file to read from will cause `upload` to read the list of
files from `stdin` - this allows e.g. using `find -print0` to produce a list
of matching files to upload.

```yaml
steps:
  - commands:
      - yarn install
      - yarn build
    plugins:
      - vital-software/monofo#v3.1.1:
          upload:
            node-modules.tar.lz4:
              filesFrom: node-modules.list
              null:      true
            build.tar.caidx:
              - "dist/**"
              - "another/dist/**"
```


Passing a "filesFrom" list can be much faster than using globs, because it 
allows the use of `-prune` (to early-exit from a `find` traversal, skipping a 
lot of file I/O). This is particularly useful for finding large numbers of small
files by pointing at their parent directories e.g. `node_modules/`)

## Downloads

The `download` subcommand accepts a list of artifacts to download. If these
artifacts end with a supported tarball suffix (`.tar.lz4` or `.tar.caidx`),
they'll be automatically inflated and extracted in-place. The download and
extract happens in a `pre-command`, so by the time the `command` runs, the
necessary files will be in place.

```yaml
steps:
  - commands:
      - yarn run some-command
    plugins:
      - vital-software/monofo#v3.1.1:
          download:
            - node-modules.tar.lz4
            - build.tar.cbidx
```


## Compression and Syncing

Compression is automatically applied during the `upload`, based on the target
filename for the tarball, and then transparently removed during the `download`.
The supported compression types are:

 - `.tar.lz4`: uses `lz4` to compress the tar
 - `.tar.caidx`: uses `desync` to store the tar in a content-addressed store,
  replacing the tarball with an "index file"

### Desync

Monofo uses [desync](https://github.com/folbricht/desync) to provide content-addressed
caching and storage, speeding up the upload and download of artifacts and cached files.

#### Installing desync

In order for Monofo to use desync, it must be available on the `PATH`. You can
build a `desync` binary for your platform using `go install`:

```shell
GOOS=linux GOARCH=amd64 go install github.com/folbricht/desync/cmd/desync@latest
```

#### Configuring desync

desync must also be configured using the `MONOFO_DESYNC_FLAGS` environment variable
before it'll be available for use. This environment variable is substituted into
the eventual desync command, and a suitable value will usually declare `--store`
and `--cache` options (without at least one, desync will not work).

```shell
export MONOFO_DESYNC_FLAGS="-c /tmp/desync-cache -s s3+https://s3-us-west-2.amazonaws.com/some-build-cache-bucket/prefix"
```

