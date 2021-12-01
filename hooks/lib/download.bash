[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
_lib_script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
set -euo pipefail

# shellcheck source=./run.bash
source "$_lib_script_dir/run.bash"
MONOFO=$(monofo "pipeline")

BUILDKITE_PLUGIN_MONOFO_DOWNLOAD=${BUILDKITE_PLUGIN_MONOFO_DOWNLOAD:-}

# Downloads and expands artifacts
#
# Does so:
#  - in parallel across all the artifacts that need to be retrieved
#  - streaming the download to the decompress/inflate operation for speed
#  - with support for pulling artifacts from previous base builds

if [[ "${PRE_COMMAND_DEBUG:-0}" -eq 1 ]]; then
  set -x
fi

env | grep MONOFO >&2

# shellcheck disable=SC2086
eval ${MONOFO} download $BUILDKITE_PLUGIN_MONOFO_DOWNLOAD
