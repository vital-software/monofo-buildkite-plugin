[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
set -euo pipefail

# This version marker is automatically updated to match the published release
export MONOFO_VERSION=3.0.1

# This turns on debugging for monofo, which is important to see what's going on
export DEBUG="monofo:*"

function monofo() {
    echo "npx monofo@$MONOFO_VERSION ${*}"
}
