## Artifact Caching

Monofo uses [desync](https://github.com/folbricht/desync) to provide content-addressed 
caching and storage, speeding up the upload and download of artifacts and cached files. 

### Installing desync

In order for Monofo to use desync, it must be available on the `PATH`. You can
build a `desync` binary for your platform using `go install`:

```shell
GOOS=linux GOARCH=amd64 go install github.com/folbricht/desync/cmd/desync@latest
```

### Configuring desync

desync must also be configured using the `MONOFO_DESYNC_FLAGS` environment variable
before it'll be available for use. This environment variable is substituted into
the eventual desync command, and a suitable value will usually declare `--store`
and `--cache` options (without at least one, desync will not work).

```shell
export MONOFO_DESYNC_FLAGS="-c /tmp/desync-cache -s s3+https://s3-us-west-2.amazonaws.com/some-build-cache-bucket/prefix"
```

