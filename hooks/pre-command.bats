#!/usr/bin/env bats

load "$BATS_PATH/load.bash"

# Uncomment to enable stub debugging
export NPX_STUB_DEBUG=/dev/tty
export GIT_STUB_DEBUG=/dev/tty

@test "calls npx when generating a pipeline" {
  export BUILDKITE_PLUGIN_MONOFO_GENERATE="pipeline"

  stub npx "monofo@2.0.1 : echo npx output"
  stub git "* : echo git output"

  run $PWD/hooks/pre-command

  assert_output --partial "git output"
  assert_output --partial "npx output"
  assert_success

  unstub npx
  unstub git
}
