#!/usr/bin/env bats

setup() {
  export PRE_COMMAND_DEBUG=1

  PROJECT_ROOT="$(dirname "$BATS_TEST_DIRNAME")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/generate.bash"

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

@test "soft-fail allows curl failures" {
  export TYPESCRIPT_SOFT_FAIL=1

  # Mock failing curl
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/curl"
  echo "echo 'Failed to download (fake)'; exit 2" >> "$BATS_TMPDIR/curl"
  chmod +x "$BATS_TMPDIR/curl"

  run $SUT typescript
  [[ $? -eq 0 ]]
}

@test "pre-command works with fake package" {
  mkdir -p "$BATS_TMPDIR/package/dist"
  touch "$BATS_TMPDIR/package/dist/foo.ts"
  tar -c --use-compress-program="lz4 -2" -f "$BATS_TMPDIR/typescript.tar.lz4" "$BATS_TMPDIR/package"

  # Mock passing curl
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/curl"
  echo "cat $BATS_TMPDIR/typescript.tar.lz4" >> "$BATS_TMPDIR/curl"
  chmod +x "$BATS_TMPDIR/curl"

  run $SUT typescript
  [[ $? -eq 0 ]]
}
