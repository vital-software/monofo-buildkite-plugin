#!/usr/bin/env bats

setup() {
  export PATH="$BATS_TMPDIR:$PATH"

  # Mock npx monofo
  echo "#!/usr/bin/env bash" > "$BATS_TMPDIR/npx"
  echo "if [[ \$1 == """monofo@*""" ]]; then echo \"npx output\"; else echo 'no good' >&3; echo \$1 >&3; exit 2; fi" >> "$BATS_TMPDIR/npx"
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
  output="$(source $PWD/generate.bash)"

  [[ "$output" = *"npx output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
  [[ "$output" = *"git output"* ]] || ( echo "Failed to match: $output" >&3 && exit 2 )
}
