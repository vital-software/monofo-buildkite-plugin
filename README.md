# monofo

A Buildkite dynamic pipeline generator for monorepos. `monofo` lets you split
your `.buildkite/pipeline.yml` into multiple components, each of which will
only be run if it needs to be (based on what's changed since the last build).

Monofo keeps your pipeline running the same way it always has (e.g. you don't
have to split your pipeline and use triggers), while potentially saving heaps of
time by only building what you need.

## Basic usage

Instead of calling `buildkite-agent pipeline upload` in the first step of a
pipeline, execute `monofo pipeline` which will output the dynamic pipeline on
stdout: `npx monofo pipeline | buildkite-agent pipeline upload`

To make this easier, Monofo supports configuration as a Buildkite plugin, so
an example to generate your pipeline might be:

```yaml
steps:
  - name: ":pipeline: Generate pipeline"
    command: echo "Monorepo pipeline uploaded"
    plugins:
      - seek-oss/aws-sm#v2.2.1: # for example, but your secret management might be e.g. via S3 bucket or "env" file instead
          env:
            BUILDKITE_API_ACCESS_TOKEN: "global/buildkite-api-access-token"
      - vital-software/monofo#v3.8.1:
          generate: pipeline
```

Note that Monofo requires an environment variable to be configured, allowing it
to access the Buildkite API. This is the `BUILDKITE_API_ACCESS_TOKEN`
environment variable. See [Configuration](#configuration) for details.

### Splitting pipelines using multiple `pipeline.yml` files

Split your `.buildkite/pipeline.yml` into whatever components you'd like
and give them with a short name, like: `pipeline.<component>.yml`. Each of these
pipeline files can contain their own set of steps and environment variables.

Next, add a `monorepo` configuration section to the top of each of these
component pipelines. Declare any input (`produces`) and output (`expects`)
artifacts that your pipeline either builds or needs. An example configuration is:

```yaml
monorepo:
  expects:  node-modules.tar.gz
  produces: app.tar.gz
  matches:
    - serverless.yml
    - app/**.ts
```

The `matches` configuration defines a set of (minimatch) glob-style paths to
match. If there are any differences on your build that match ([when compared to
a carefully selected base commit](docs/diff.md)), the component build is fully included in the
resulting output pipeline.

However, if there are no matches for a component, its steps will be replaced by
"dummy steps" that will download the artifacts that _would have_ been produced
had the component run (these artifacts are downloaded from the base commit's
build).

For convenience, if you change `pipeline.foo.yml`, that change will
automatically be considered matching for the `foo` pipeline, without having to
add that pipeline file to the `matches` array yourself.


## Features

### Get artifacts for skipped components with `expects`/`produces`

A pipeline configuration can define the artifacts that the component build `expects` in
order to run, and those that the build `produces` if successful. For example:

```yaml
monorepo:
  expects:  blah.cfg
  produces: output/foo.zip
  [...]
```

These are used:

- to put the component pipelines into a dependency order
- to know what artifacts should be pulled from a previous build when needed
  (i.e. when a component pipeline can be skipped)

### Deflate/inflate artifacts to convenient archive formats

See [artifacts](docs/artifacts.md) for more information

You can use the plugin to `upload` and `download` artifacts to compressed tarballs
using good compression algorithms such as `lz4`, or even content-addressing-based
caching systems such as [`desync`](https://github.com/folbricht/desync) (a casync
implementation)

The following breaks your `node_modules/` artifact up into chunks, and caches
the chunks locally and on S3:

```yaml
env:
  MONOFO_DESYNC_STORE: "s3+https://s3.amazonaws.com/some-bucket/desync/store"
  MONOFO_DESYNC_CACHE: "/tmp/monofo/desync-store"

steps:
  - command: yarn install
    plugins:
      - vital-software/monofo#v3.8.1:
          upload:
            node-modules.catar.caibx:
              - "node_modules/"
```

The resulting `node-modules.catar.caibx` only contains pointers to the full content
chunks, and as a result, is only 200KiB for a 500MB node_modules/ artifact. This
means it can upload/download in seconds.

### Content-based build skipping (`pure`)

See [content-based build skipping](docs/pure.md) for more information

You can mark a pipeline as pure by setting the `monorepo.pure` flag to `true` -
this indicates that it doesn't have side-effects other than producing its
artifacts, and the only inputs it relies on are listed in its `matches`.

Doing so enables an extra layer of caching, based on the contents of the input
files. For example:

```yaml
monorepo:
  pure: true
  matches:
    - package.json
    - yarn.lock
```

In any future build, if `package.json` and `yarn.lock` have the same content,
this pipeline will be skipped.

### Branch inclusion/exclusion filters

If you require more specificity for what branches do or do not run your pipelines,
there is a branch filter that matches the [Buildkite step-level branch filtering
rules](https://buildkite.com/docs/pipelines/branch-configuration#branch-pattern-examples).

```yaml
monorepo:
  expects:  blah.cfg
  produces: output/foo.zip
  branches: 'main'
```

### Controlling what is included

These rules are applied in the order listed here.

#### PIPELINE_RUN_ALL

If you set the environment variable `PIPELINE_RUN_ALL=1`, all parts of the
pipeline will be output; this is a good way to "force a full build", or disable
monofo temporarily.

#### PIPELINE_RUN_ONLY

If you set `PIPELINE_RUN_ONLY=component-name`, that component will be included,
and others excluded, regardless of matches. Pipeline-level `depends_on` will
still be respected.

#### PIPELINE_RUN_\*, PIPELINE_NO_RUN_\*

If you set `PIPELINE_RUN_<COMPONENT_NAME>=1`, that component will be included,
even if it wouldn't ordinarily. And if you set `PIPELINE_NO_RUN_<COMPONENT_NAME>`
that component will never be included, even if it does have matches.


## Configuration

The main required piece of configuration is the `BUILDKITE_API_ACCESS_TOKEN`

### Buildkite API access token

When calculating the commit to diff against, monofo uses Buildkite API to look
up the last successful build of the current branch. To do so, monofo needs a
Buildkite API access token set as the environment variable
`BUILDKITE_API_ACCESS_TOKEN`. You'd probably set this in your Buildkite build
secrets.

The token only needs the `read_builds` scope. We need an _API_ token, not an
_agent_ token.

### DynamoDB setup

DynamoDB setup is only required if you're intending to use [pure mode](docs/pure.md#dynamodb-setup)

## Development

- `yarn commit` - Start a commit with formatting
- `yarn test` - Runs the tests
- `yarn build` - Compiles Typescript

<!-- commands -->
# Command Topics

* [`monofo autocomplete`](docs/commands/autocomplete.md) - display autocomplete installation instructions
* [`monofo base-commit`](docs/commands/base-commit.md) - output a base commit hash, against which the current build would be compared
* [`monofo deflate`](docs/commands/deflate.md) - deflate a tar resource into a given artifact name
* [`monofo download`](docs/commands/download.md) - Downloads the given list of artifacts, inflating them if they are suitable archives
* [`monofo hash`](docs/commands/hash.md) - hash the specified component and output the value
* [`monofo inflate`](docs/commands/inflate.md) - install a DynamoDB table to store cache pointers for pure builds
* [`monofo install`](docs/commands/install.md) - install a DynamoDB table to store cache pointers for pure builds
* [`monofo list`](docs/commands/list.md) - list matching files for different parts of the pipeline
* [`monofo pipeline`](docs/commands/pipeline.md) - generate a dynamic pipeline.yml and output it
* [`monofo record-success`](docs/commands/record-success.md) - Record success of a component of the build, so that we can skip it next time if possible
* [`monofo uninstall`](docs/commands/uninstall.md) - Uninstalls the Monofo DynamoDB tables
* [`monofo upload`](docs/commands/upload.md) - Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts
* [`monofo which`](docs/commands/which.md) - Show which plugin a command is in.

<!-- commandsstop -->
