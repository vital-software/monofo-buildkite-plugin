## Diff Algorthim

When calculating what needs to be done in a build, Monofo first selects a "base" build. This is used as the commit to diff against, when producing a list of
files that have changed. There are some requirements of the base build:

1. There is an associated Buildkite build that is successful, fully applied, and not blocked, for the base build's commit
2. The base build's commit is an ancestor of the commit being tested (i.e. the hase commit was at or before the currently building commit on the branch)

There are three different algorithms used for selecting the base build:

- For feature branches, we always want the build to encompass the entire branch. We look backward from the merge-base of the branch and the default branch, so that the entire branch is in the diff.
- For the default branch, the base build is always on the current branch, so we just look back at builds for the branch until we find ones that passed. Then we match them to the git
  log of ancestor commits.
- For integration branches, we disable rule 2, because those branches are often reset, and we still want to diff in those circumstances (even if the last successful build doesn't represent a direct ancestor commit)

## Configuration

### Configuring an integration branch

You can configure a branch to considered as an integration branch by environment variable:

```bash
MONOFO_INTEGRATION_BRANCH=some-branch-name
```

When set, iff the named branch is the one currently being built, then we do an integration build. Otherwise, we check if the branch is the default branch, and finally fall back to a feature branch build.

### Changing the default branch

```bash
MONOFO_DEFAULT_BRANCH=main
```
