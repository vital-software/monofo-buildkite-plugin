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

The glob expressions and paths must be relative, and point to locations below
the working directory. Intermediate directories between the working directory
and the target paths will be included in the archive as (otherwise empty)
placeholder structure.

Passing `-` as the file to read from will cause `upload` to read the list of
files from `stdin` - this allows e.g. using `find -print0` to produce a list
of matching files to upload.

```yaml
steps:
  - commands:
      - yarn install
      - yarn build
    plugins:
      - vital-software/monofo#v5.0.12:
          upload:
            node-modules.tar.lz4:
              filesFrom: node-modules.list
              null:      true
            build.catar.caibx:
              - "dist/**"
              - "another/dist/**"
```


Passing a "filesFrom" list can be much faster than using globs, because it
allows the use of `-prune` (to early-exit from a `find` traversal, skipping a
lot of file I/O). This is particularly useful for finding large numbers of small
files by pointing at their parent directories e.g. `node_modules/`)

## Downloads

The `download` subcommand accepts a list of artifacts to download. If these
artifacts end with a supported tarball suffix (see compression section below),
they'll be automatically inflated and extracted in-place. The download and
extract happens in a `pre-command`, so by the time the `command` runs, the
necessary files will be in place.

```yaml
steps:
  - commands:
      - yarn run some-command
    plugins:
      - vital-software/monofo#v5.0.12:
          download:
            - node-modules.tar.lz4
            - build.catar.caibx
```

## Compression

Compression is automatically applied during the `upload`, based on the target
filename for the tarball, and then transparently removed during the `download`.
The supported compression types are:

- `.tar`: uses no compression
- `.tar.gz`: uses `gzip` to compress the tar
- `.tar.lz4`: uses `lz4` to compress the tar
- `.catar.caibx`: uses `desync` to store the tar in a content-addressed store,
  replacing the tarball with an "index file"

### Desync (for content-addressed caching)

Monofo uses [desync](https://github.com/folbricht/desync) to provide
content-addressed caching and storage, speeding up the upload and download of
artifacts and cached files.

It uses it in a few ways:

 - We use it to turn a `.tar` archive into a `.catar` archive
   - This makes it more amenable to further content-addressing by addressing directories by their contents, and chunking by directory
   - It doesn't reorder entries, so we have to make sure the input tar is nicely
 - We then index that `.catar` into an index file (given a `.caibx` extension)
   - This chops the file up into chunks, which are stored on S3 (and in a local
     cache). The index file then contains the hashes (content addresses) of the
     chunked parts of the original file.
   - We keep the original `.catar` around for "seeding": large parts of the
     inflated archive can be used the next time we need to extract the same _or
     a similar_ archive (they'll be directly copied, which should be very fast)

#### Installing desync

In order for Monofo to use desync, it must be available on the `PATH`. You can
build a `desync` binary for your platform using `go install`:

```shell
GOOS=linux GOARCH=amd64 go install github.com/folbricht/desync/cmd/desync@latest
```

#### Configuring desync

There are a few main configuration environment variables:

- `MONOFO_DESYNC_STORE`: Usually, an S3 bucket, used to store content-addressed
   chunks
- `MONOFO_DESYNC_CACHE`: Usually, a local directory, used as a look-through
   cache when they'd otherwise be downloaded from S3
- `MONOFO_DESYNC_SEED_DIR`: Always a local directory, used as a place to retain
   inflated archives for use as seed files for later extract operations

It's important that any of these that refer to local paths are on the same
filesystem, e.g. so that `mv` is atomic and fast.

These environment variables are substituted into the eventual desync command as
the `--store` and `--cache` options. For example, Monofo itself uses:

```typescript
MONOFO_DESYNC_STORE: "s3+https://s3-us-west-2.amazonaws.com/some-s3-bucket-name/desync/store"
MONOFO_DESYNC_CACHE: "/tmp/monofo/desync-store"
MONOFO_DESYNC_SEED_DIR: "/tmp/monofo/desync-seeds"
```

The `s3+https://` scheme is explained at [folbricht/desync](https://github.com/folbricht/desync#s3-chunk-stores)
