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
      - vital-software/monofo#v3.1.2:
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
component pipelines. An example configuration is:

```yaml
monorepo:
  expects:  blah.cfg
  produces: output/foo.zip
  matches:
    - foo.cfg
    - foo/**/*.js
```

The `matches` configuration defines a set of (minimatch) glob-style paths to
match. If there are any differences on your build that match (when compared to
a carefully selected base commit), the component build is fully included in the
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

#### Phony artifacts in `expects`/`produces`

As a special case, any artifact prefixed with `.phony/` is considered to not be
a real file. These artifacts are still evaluated when _ordering_ pipeline steps,
but they won't be actually downloaded.

### Repeatable build skipping (`pure` flag)

You can mark a pipeline as pure by setting the `monorepo.pure` flag to `true` -
this indicates that it doesn't have side-effects other than producing its
artifacts, and the only inputs it relies on are listed in its `matches`.
This means an extra layer of caching can be used, based on the
contents of the files in the `matches` globs.  For example:

```yaml
monorepo:
  pure: true
  matches: input-file.txt
  produces: output-file.txt

steps:
  - command: do-something < input-file.txt > output-file.txt
    plugins:
      - artifacts#v1.3.0:
          upload: output-file.txt
```

When this build finishes, the contents of `input-file.txt` will be hashed.
In any future build, if that file has the same contents, instead of running
the `do-something` command step, `output-file.txt` will be directly downloaded
from the last build that produced it successfully (and injected with the other
artifacts at the start of the build)

Pure mode uses external metadata to be able to reuse artifacts from previous
builds efficiently. Content hash to build ID mappings are stored in
DynamoDB, so if you are using pure mode you will need to do some additional
configuration. See [DynamoDB Setup](#dynamodb-setup)

### Branch inclusion/exclusion filters
If you require more specificity for what branches do or do not run your pipelines,
there is a branch filter that matches the buildkite step-level branch filtering rules.
See [Buildkite Branch Configuration](https://buildkite.com/docs/pipelines/branch-configuration#branch-pattern-examples)

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

DynamoDB setup is only required if you're intending to use [pure mode](#repeatable-build-skipping-pure-flag)

For starters, you'll need to run `monofo` as a user that can read and write to
the `monofo_cache_metadata` DynamoDB table. How to do this depends on your
own Buildkite stack, but you'd generally attach a policy that looks like this
to the Buildkite role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MonofoCacheMetadataAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:DeleteTable",
        "dynamodb:CreateTable",
        "dynamodb:BatchGetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/monofo_cache_metadata"
    }
  ]
}
```

Then you should create the DynamoDB table so that it's ready for use. To do
this, you can use `monofo install` to create the needed table (and
`monofo uninstall` to remove it again should you need to). Finally, you can test
 writing to the DynamoDB table using the `monofo record-success` command.


## CLI

```
$ monofo --help
Monofo provides utilities for dynamically generating monorepo pipelines

Commands:
  monofo base-commit  Output a base commit hash, from which the current build
                      should be compared
  monofo pipeline     Output a merged pipeline.yml                     [default]

Options:
      --version  Show version number                                   [boolean]
  -v, --verbose  Run with verbose logging             [boolean] [default: false]
      --help     Show help                                             [boolean]

Visit https://github.com/vital-software/monofo for documentation about this command.
```


## Development

- `yarn commit` - Start a commit with formatting
- `yarn test` - Runs the tests
- `yarn build` - Compiles Typescript
