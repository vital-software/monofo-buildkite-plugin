[[ "${BASH_SOURCE[0]}" == "${0}" ]] && echo "Not for direct execution" && exit 2 || true
set -euo pipefail

# shellcheck source=./run.bash
source "$_lib_script_dir/run.bash"
MONOFO=$(monofo "pipeline")

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
echo "Exiting with debug" >&2

# shellcheck disable=SC2086
eval ${MONOFO} download $BUILDKITE_PLUGIN_MONOFO_DOWNLOAD

#if [[ $# -lt 1 ]]; then
#  echo "Expected to receive a list of artifact tarballs to download: node-modules typescript etc." >&2
#  exit 2
#fi
#
#echo "--- Downloading and inflating artifacts for ${*}"
#
#pids=()
#
#for file in "${@}"; do
#  (
#    echo "Searching for ${file} [$BASHPID]" >&2
#    agent_args=()
#
#    env_key=${file//-/_}
#    env_key=${env_key^^}
#
#    skip_env=${env_key}_SKIP
#    build_id_env=${env_key}_BUILD_ID # Like NODE_MODULES_BUILD_ID
#    soft_fail_env=${env_key}_SOFT_FAIL
#
#    echo "Looking at env vars: $skip_env=${!skip_env:-} $build_id_env=${!build_id_env:-} $soft_fail_env=${!soft_fail_env:-}" >&2
#
#    if [[ -n "${!skip_env:-}" ]]; then
#      echo "Skipping artifact because $skip_env was set" >&2
#      return
#    fi
#
#    if [[ -n "${!build_id_env:-}" ]]; then
#      agent_args+=("--build" "${!build_id_env}")
#    fi
#
#    if [[ -n "${!soft_fail_env:-}" ]]; then
#      set +e
#    fi
#
#    url="$(buildkite-agent artifact search --format $'%u\n' ${agent_args[@]+"${agent_args[@]}"} "${file}.tar.lz4" | head -n 1)"
#
#    if [[ -z "$url" || $(echo "$url" | wc -l) -ne 1 ]]; then
#      if [[ -z "${!soft_fail_env:-}" ]]; then
#        echo "Could not find unique download URL for artifact ${file} [$BASHPID]" >&2
#        exit 3
#      else
#        echo "Could not find unique download URL for artifact ${file}; skipping because soft fail enabled [$BASHPID]" >&2
#      fi
#    else
#      echo "Starting download and inflate of ${file} [$BASHPID]" >&2
#      curl -fsS -o - "$url" | tar -xv --use-compress-program=lz4 -f - 2>&1 | wc -l | xargs -IN echo "N files inflated from ${file} [$BASHPID]" >&2
#      success=$?
#
#      if [[ $success -ne 0 ]]; then
#        echo "^^^ +++ :x: Failed to download and extract ${file} [$BASHPID]" >&2
#      fi
#    fi
#
#    set -e
#  ) &
#  pids+=($!)
#done
#
#set +e
#failures=0
#for pid in ${pids[*]}; do
#  if [[ $failures -gt 0 ]]; then
#    echo "Interrupting because of failures in other downloads [$pid]"
#    kill $pid 2> /dev/null || true
#  else
#    echo "Waiting to finish... [$pid]" >&2
#    if ! wait "$pid"; then
#      echo "" >&2
#      echo "^^^ +++ :x: Failure in [$pid]! Cancelling remaining work and returning error" >&2
#      failures=$((failures+1))
#    fi
#  fi
#done
#set -e
#
#if [[ $failures -gt 0 ]]; then
#  echo "Failed to download or inflate artifacts" >&2
#  exit $failures
#fi
#
#echo "All done." >&2
#exit 0
