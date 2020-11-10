# monofo

- [Basic Usage](#basic-usage)
  - [Splitting pipelines using multiple `pipeline.yml` files](#splitting-pipelines-using-multiple-pipelineyml-files)
- [Configuration](#configuration)
  - [Buildkite API Access Token](#buildkite-api-access-token)
- [Advanced Features](#advanced-features)
  - [Pure pipelines](#pure-pipelines)
  - [Controlling what is included](#controlling-what-is-included)
    - [PIPELINE_RUN_ALL](#pipeline_run_all)
    - [PIPELINE_RUN_ONLY](#pipeline_run_only)
    - [PIPELINE_RUN_\*, PIPELINE_NO_RUN_\*](#pipeline_run_-pipeline_no_run_)
  - [Pipeline file changes match themselves](#pipeline-file-changes-match-themselves)
  - [Phony deps](#phony-deps)
  - [Depends On](#depends-on)
- [CLI](#cli)
- [Development](#development)


A Buildkite dynamic pipeline generator for monorepos. `monofo` lets you split
your `.buildkite/pipeline.yml` into multiple components, each of which will
only be run if it needs to be (based on what's changed since the last build).

Monofo keeps your pipeline running the same way it always has (e.g. you don't
have to split your pipeline and use triggers), while potentially saving heaps of
time by only building what you need.


## Basic Usage

Instead of calling `buildkite-agent pipeline upload` in the first step of a
pipeline, execute `monofo pipeline` which will output the dynamic pipeline on
stdout.

```sh
npx monofo pipeline | buildkite-agent pipeline upload
```


### Splitting pipelines using multiple `pipeline.yml` files

Split your `.buildkite/pipeline.yml` into whatever components you'd like
and give them with a short name, like: `pipeline.<component>.yml`. Each of these
pipeline files can contain their own set of steps and environment variables.

Next, add a `monorepo` configuration section to the top of each of these
component pipelines. An example configuration is:

```
monorepo:
  expects:  blah.cfg
  produces: output/foo.zip
  matches:
    - foo.cfg
    - foo/**/*.js
```

The configuration defines the artifacts that the component build `expects` in
order to run, and those the build `produces` if successful. (These are used to
put the components into the correct order.)

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


## Configuration


### Buildkite API Access Token

When calculating the commit to diff against, monofo uses Buildkite API to look
up the last successful build of the current branch. To do so, monofo needs a
Buildkite API access token set as the environment variable
`BUILDKITE_API_ACCESS_TOKEN`. You'd probably set this in your Buildkite build
secrets.

The token only needs the `read_builds` scope. We need an _API_ token, not an
_agent_ token.


## Advanced Features


### Pure pipelines

You can mark a pipeline as "pure" by setting the pure flag:

```
monorepo:
  pure: true
  matches: some-file.txt
  produces: some-other-file.txt
```

In this case, the content of the matches is used to produce a hash. If this hash
has been built before, that pipeline will be skipped, and its artifacts replaced
by the previously built ones.

#### How it works

Pure mode uses external metadata to be able to reuse artifacts from previous
builds efficiently. This takes the form of a DynamoDB table. If you're using
pure mode, you can `monofo install` to create the needed table (and
`monofo uninstall` to remove it again should you need to).

After any step that uploads an artifact passes successfully, we update a pointer
in the metdata from the content hash of the `monorepo.matches` to the current
build. Then, in any future build where the content of the files the match is the
same, we just immediately replace that whole part of the pipeline with the
correct artifact.


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


### Phony deps

Any artifacts that are prefixed with `.phony/` are considered to not be real.
These artifacts are still evaulated when ordering pipeline steps (using
`expects`/`provides`), but they won't be actually downloaded if components are
skipped.


### Depends On (deprecated)

In any component pipeline, you can specify `monorepo.depends_on` as an array of
pipeline component names (like `foo` for `pipeline.foo.yml`). Those pipelines
will be included in a build if the pipeline that `depends_on` them is included.


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
