# Artifact Caching

Monofo provides a locally cached artifact download/upload utility. This
functionality is accessed by using monofo as a Buildkite plugin from your steps.

This functionality is particularly optimized for producing and using compressed
tarballs to collect and cache very large numbers of files
(e.g. `node-modules.tar.lz4`). If you only need to upload/download a few files,
you might find it easier to use the standard
[artifacts plugin](https://github.com/buildkite-plugins/artifacts-buildkite-plugin).

## Uploads

The `upload` subcommand accepts a list of files to upload under each artifact as
either positional arguments, or from a file, or a stream (by passing
`--files-from -` to read stdin)

```yaml
steps:
  - commands:
      - yarn install
      - yarn build
    plugins:
      - vital-software/monofo#v3.0.3:
          upload:
            node-modules.tar.lz4:
              filesFrom: node-modules.list
              null:      true
            build.tar.caidx:
              - "dist/**"
              - "another/dist/**"
```

The artifact filename will determine the treatment given to each uploaded file;
this is so that the artifact name is deterministic.

The first style (`filesFrom`) is more performant than the second (a list of
globs), because it e.g. allows the use of `-prune` (to early-exit from a `find`
traversal, skipping a lot of file I/O; this is particularly useful for finding
large numbers of small files by pointing at their parent directory)

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
<<<<<<<
      - vital-software/monofo#v3.0.2:
=======
      - vital-software/monofo#v3.0.3:
>>>>>>>
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

