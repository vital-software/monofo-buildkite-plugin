#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/upload.bash"

  # Mock npx
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$1 = \"monofo@\"* && \$2 = \"upload\" ]]; then echo \"npx output\"; else echo \"Unknown npx utility \$1\" >&2; exit 2; fi" >> "$BATS_TMPDIR/npx"
  chmod +x "$BATS_TMPDIR/npx"
}

teardown() {
  rm -rf "$BATS_TMPDIR/npx"
}

@test "calls monofo upload when called with config" {
  export BUILDKITE_PLUGIN_CONFIGURATION='{"upload":{"build.caidx":["dist/**","another/dist/**"],"node-modules.tar.lz4":{"filesFrom":"node-modules.list","null":true}}}'

  # shellcheck source=./upload.bash
  output="$(source $SUT)"

  [[ "$output" = *"npx output"*"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
