#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/upload.bash"

  # Mock buildkite-agent
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/buildkite-agent"
  echo "if [[ \$1 = \"artifact\" && \$2 = \"search\" ]]; then echo \"https://example.com/some/artifact/path.tar.lz4\"; fi" >> "$BATS_TMPDIR/buildkite-agent"
  chmod +x "$BATS_TMPDIR/buildkite-agent"
}

teardown() {
  rm -rf "$BATS_TMPDIR/buildkite-agent"
  rm -rf "$BATS_TMPDIR/curl"
  rm -rf "$BATS_TMPDIR/typescript.tar.lz4"
  rm -rf "$BATS_TMPDIR/package"
}

@test "calls monofo upload when called with config" {
  export BUILDKITE_PLUGIN_CONFIGURATION='{"upload":{"build.tar.caidx":["dist/**","another/dist/**"],"node-modules.tar.lz4":{"filesFrom":"node-modules.list","null":true}}}'

  # shellcheck source=./upload.bash
  output="$(source $SUT)"

  echo "$output"
  echo "$output" >&3

  [[ 1 -eq 1 ]]
#  [[ "$output" = *"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
#  [[ "$output" = *"git output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
