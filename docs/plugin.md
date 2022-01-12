# Buildkite Plugin

Monofo was originally developed as an independent pipeline generator binary,
packaged on NPM, and it's still possible to use it that way. For example, you
can call `npx monofo@latest help` to get a list of subcommands.

But it can now also be utilized through Buildkite YAML configuration directly,
which you can see in examples like:

```yaml
steps:
  - commands:
      - yarn install
      - yarn build
    plugins:
      - vital-software/monofo#v3.6.6:
          upload:
            node-modules.tar.lz4:
              - ./node_modules/
```

## Configuration

Internally, the hook scripts use `npx` to invoke Monofo, with a static version
matching whatever you specify in your pipeline.yml.

This is achieved by updating the `hook/` scripts (using a semantic-release plugin)
before release, so that the tagged copy of the script, by default uses the
version you ask for. However, `npx` supports interesting version specifiers,
like `beta` or `latest`, and if you want to use one of those, you can specify
`MONOFO_VERSION`:

```yaml
env:
  MONOFO_VERSION: beta
```

### Debugging

If you also want to debug the hook scripts, you can set the environment variable
`MONOFO_HOOK_DEBUG` to `1`:

```yaml
env:
  MONOFO_HOOK_DEBUG: '1'
```

This will cause hook scripts to print additional debugging information to stderr
(using `set -x` essentially)
