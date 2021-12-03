[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
_lib_script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
set -euo pipefail

# shellcheck source=./run.bash
source "$_lib_script_dir/run.bash"
MONOFO=$(monofo)

BUILDKITE_PLUGIN_MONOFO_DOWNLOAD="${BUILDKITE_PLUGIN_MONOFO_DOWNLOAD:-}"

# Downloads and inflates artifacts
#
# The only format supported is a simple list of artifact filenames, so we can
# rely on the default Buildkite YAML to env var system

if [[ "${MONOFO_HOOK_DEBUG:-0}" -eq 1 ]]; then
  set -x
fi

env | grep MONOFO >&2

# shellcheck disable=SC2086,SC2046
eval $MONOFO download $BUILDKITE_PLUGIN_MONOFO_DOWNLOAD
