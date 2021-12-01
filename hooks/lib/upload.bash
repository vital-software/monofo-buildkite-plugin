[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
set -euo pipefail

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

echo "Exiting after printing config" >&2
exit 0

# shellcheck disable=SC2086
eval ${MONOFO} upload $BUILDKITE_PLUGIN_MONOFO_UPLOAD
