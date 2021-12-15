#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/generate.bash"

  # Mock npx --quiet --shell sh monofo pipeline [arguments...]
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$4 = \"monofo@\"* && \$5 = \"pipeline\" ]]; then echo \"npx output\"; else echo 'no good' >&3; echo \$1 >&3; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"

  # Mock git
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/git"
  echo "echo \"git output\"" >> "$BATS_TMPDIR/git"
  chmod +x "$BATS_TMPDIR/git"
}

teardown() {
  rm -rf "$BATS_TMPDIR/git"
  rm -rf "$BATS_TMPDIR/npx"
}

@test "calls npx when generating a pipeline" {
  export BUILDKITE_PLUGIN_MONOFO_GENERATE="pipeline"

  # shellcheck source=./generate.bash
  output="$(source "$SUT")"

  [[ "$output" = *"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
  [[ "$output" = *"git output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
