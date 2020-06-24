# monofo

Buildkite dynamic pipeline generator for mono-repos

## Usage

```sh
npx monofo | buildkite-agent pipeline upload
```

### Configuration

#### Buildkite API Access Token

When calculating the commit to diff against, monofo uses Buildkite API to look 
up the last successful build of the current branch. To do so, monofo needs a 
Buildkite API access token set as the environment variable 
`BUILDKITE_API_ACCESS_TOKEN`. You'd probably set this in your Buildkite build
secrets.

The token only needs the `read_builds` scope. We need an _API_ token, not an 
_agent_ token.

## Development

- `yarn test` - Runs the tests
- `yarn build` - Compiles Typescript
