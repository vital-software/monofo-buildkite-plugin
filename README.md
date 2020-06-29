# monofo

A Buildkite dynamic pipeline generator for monorepos. `monofo` lets you split
your `.buildkite/pipeline.yml` into multiple components, each of which will
only be run if it needs to be (based on what's changed since the last build).

Monofo keeps your pipeline running the same way it always has (e.g. you don't
have to split your pipeline and use triggers), while potentially saving heaps of
time by only building what's needed.

## Basic Usage

Instead of calling `buildkite-agent pipeline upload` in the first step of a
pipeline, execute `monofo pipeline` which will output the dynamic pipeline on
stdout.

```sh
npx monofo pipeline | buildkite-agent pipeline upload
```

### Splitting `pipeline.yml`

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

## Configuration

### Buildkite API Access Token

When calculating the commit to diff against, monofo uses Buildkite API to look
up the last successful build of the current branch. To do so, monofo needs a
Buildkite API access token set as the environment variable
`BUILDKITE_API_ACCESS_TOKEN`. You'd probably set this in your Buildkite build
secrets.

The token only needs the `read_builds` scope. We need an _API_ token, not an
_agent_ token.

## Other Features

### Escape Hatch: Disabling Monofo

If you set the environment variable `PIPELINE_RUN_ALL` to any truthy value,
all parts of the pipeline will be output; a good way to "force a full build".

## CLI

```
$ monofo --help
Monofo provides utilities for dynamically generating monorepo pipelines

Commands:
  monofo.js artifact [options] <artifacts>  Ensures artifacts are present by
                                            injecting them from other builds if
                                            necessary
  monofo.js base-commit                     Output a base commit hash, from
                                            which the current build should be
                                            compared
  monofo.js pipeline                        Output a merged pipeline.yml
                                                                       [default]

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  Run with verbose logging             [boolean] [default: false]
  --help         Show help                                             [boolean]
```

## Development

- `yarn commit` - Start a commit with formatting
- `yarn test` - Runs the tests
- `yarn build` - Compiles Typescript
