#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/download.bash"

  # Mock npx --quiet --shell sh monofo download [arguments...]
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$4 = \"monofo@\"* && \$5 = \"download\" ]]; then echo \"npx output\"; else echo \"Unknown npx utility \$4\" >&2; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"
}

teardown() {
  rm -rf "$BATS_TMPDIR/npx"
}


@test "calls npx on download" {
  export BUILDKITE_PLUGIN_CONFIGURATION='{"download":["node-modules.tar.lz4","foo.bar.gz"]}'
  export MONOFO_ARTIFACT_TYPESCRIPT_SOFT_FAIL=1

  # shellcheck source=./download.bash
  output="$(source $SUT)"

  [[ "$output" = *"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
