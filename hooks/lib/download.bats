#!/usr/bin/env bats

setup() {
  export MONOFO_HOOK_DEBUG=1

  PROJECT_ROOT="$(dirname "$(dirname "$BATS_TEST_DIRNAME")")"
  PATH="$BATS_TMPDIR:$PATH"
  SUT="$PROJECT_ROOT/hooks/lib/download.bash"

  # Mock buildkite-agent
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/buildkite-agent"
  echo "if [[ \$1 = \"artifact\" && \$2 = \"search\" ]]; then echo \"https://example.com/some/artifact/path.tar.gz\"; fi" >> "$BATS_TMPDIR/buildkite-agent"
  chmod +x "$BATS_TMPDIR/buildkite-agent"
}

teardown() {
  rm -rf "$BATS_TMPDIR/buildkite-agent"
  rm -rf "$BATS_TMPDIR/curl"
  rm -rf "$BATS_TMPDIR/typescript.tar.gz"
  rm -rf "$BATS_TMPDIR/package"
}

generateFakePackage() {
  mkdir -p "$BATS_TMPDIR/package/dist"
  touch "$BATS_TMPDIR/package/dist/foo.ts"
  (
    cd $BATS_TMPDIR && tar -czf "$BATS_TMPDIR/typescript.tar.gz" package/
  )
}

@test "soft-fail allows curl failures" {
  export MONOFO_ARTIFACT_TYPESCRIPT_SOFT_FAIL=1

  # Mock failing curl
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/curl"
  echo "echo 'Failed to download (fake)'; exit 2" >> "$BATS_TMPDIR/curl"
  chmod +x "$BATS_TMPDIR/curl"

  run $SUT typescript.tar.gz
  [[ $? -eq 0 ]]
}

@test "pre-command works with fake package" {
  # Mock passing curl
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/curl"
  echo "cat $BATS_TMPDIR/typescript.tar.gz" >> "$BATS_TMPDIR/curl"
  chmod +x "$BATS_TMPDIR/curl"

  generateFakePackage

  run $SUT typescript.tar.gz
  [[ $? -eq 0 ]]
}
