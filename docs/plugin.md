# Buildkite Plugin

Monofo was originally developed as an independent pipeline generator binary,
packaged on NPM, and it's still possible to use it that way. For example, you
can call `npx monofo@latest help` to get a list of subcommands.

But it can now also be utilized through Buildkite YAML configuration directly.
There are a few things to be aware of when using this support.

- Internally, the hook scripts still use `npx` to invoke Monofo, with a static
  version matching whatever you specify in your pipeline.yml
- You can debug the hook scripts with `MONOFO_HOOK_DEBUG=1`; they'll print to
  stderr
