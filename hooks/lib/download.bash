[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
_lib_script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
set -euo pipefail

# shellcheck source=./run.bash
source "$_lib_script_dir/run.bash"
MONOFO=$(monofo)

if [[ -z "${BUILDKITE_PLUGIN_CONFIGURATION:-}" ]]; then
  echo "Expected BUILDKITE_PLUGIN_CONFIGURATION to be set" >&2
  exit 1
fi

# Downloads and inflates artifacts
#
# The only format supported is a simple list of artifact filenames
#
# Example: BUILDKITE_PLUGIN_CONFIGURATION='{"download":["build.caidx","node-modules.tar.lz4"]}'
# Example: BUILDKITE_PLUGIN_CONFIGURATION='{"download":"node-modules.tar.lz4"}'

if [[ "${MONOFO_HOOK_DEBUG:-0}" -eq 1 ]]; then
  set -x
fi

flags=(download)
files=$(echo "$BUILDKITE_PLUGIN_CONFIGURATION" | jq -rc '[.download] | flatten | .[]')

for file in $files; do
  flags+=("$file")
done

echo "Going to run ${MONOFO} ${flags[*]}" >&2
${MONOFO} "${flags[@]}"
