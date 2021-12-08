#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$BATS_TEST_DIRNAME")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/post-command"

  export PATH="$BATS_TMPDIR:$PATH"

  # Mock npx monofo
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$1 == """monofo@*""" ]]; then echo \"npx output\"; else echo 'no good' >&3; echo \$1 >&3; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"
}

teardown() {
  rm -rf "$BATS_TMPDIR/git"
  rm -rf "$BATS_TMPDIR/npx"
}

@test "calls into upload when given config" {
  export BUILDKITE_PLUGIN_CONFIGURATION='{"upload":{"node-modules.tar.lz4":["./node_modules/"]}}'
  run "$SUT"

  [[ "$output" = *"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
