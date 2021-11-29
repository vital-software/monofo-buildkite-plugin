## Artifact Caching

Monofo uses [desync](https://github.com/folbricht/desync) to provide content-addressed 
caching and storage, speeding up the upload and download of artifacts and cached files. 

### Installing desync

In order for Monofo to use `desync`, it must be available on the `PATH`. You can
build a binary of `desync` for your platform using `go install`:

```
GOOS=linux GOARCH=amd64 go install github.com/folbricht/desync/cmd/desync@latest
```
