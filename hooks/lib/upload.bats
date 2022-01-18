#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/upload.bash"
}

teardown() {
  rm -rf "$BATS_TMPDIR/npx"
}

@test "calls monofo upload when called with config" {
  # Mock npx --quiet --shell sh monofo upload [arguments...]
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$4 = \"monofo@\"* && \$5 = \"upload\" ]]; then echo \"npx output\"; else echo \"Unknown npx utility \$4\" >&2; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"

  export BUILDKITE_PLUGIN_CONFIGURATION='{"upload":{"build.catar.caibx":["dist/**","another/dist/**"],"node-modules.tar.lz4":{"filesFrom":"node-modules.list","null":true}}}'

  # shellcheck source=./upload.bash
  output="$(source $SUT)"

  [[ "$output" = *"npx output"*"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}


@test "fails if monofo upload fails" {
  # Mock npx --quiet --shell sh monofo upload [arguments...] FAILURE
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$4 = \"monofo@\"* && \$5 = \"upload\" ]]; then echo \"fake error output\"; exit 2; else echo \"Unknown npx utility \$4\" >&2; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"

  export BUILDKITE_PLUGIN_CONFIGURATION='{"upload":{"build.catar.caibx":["dist/**","another/dist/**"],"node-modules.tar.lz4":{"filesFrom":"node-modules.list","null":true}}}'

  set +e
  # shellcheck source=./upload.bash
  output=$(source $SUT)
  result=$?
  set -e

  [[ "$output" = *"fake error output"* && $result -ne 0 ]] || ( echo "Expected failure in overall command if upload fails: got $result" >&3 && exit 2 )
}
