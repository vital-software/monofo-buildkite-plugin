# [0.8.0](https://github.com/vital-software/monofo/compare/v0.7.0...v0.8.0) (2020-07-01)


### Features

* **pipeline:** added a message at the end of an empty pipeline ([d88032b](https://github.com/vital-software/monofo/commit/d88032bb00ee0ba531b5226a790b8441c9376447))

# [0.7.0](https://github.com/vital-software/monofo/compare/v0.6.2...v0.7.0) (2020-07-01)


### Features

* **pipeline:** use the artifacts plugin to download and inject missing artifacts ([4e19f03](https://github.com/vital-software/monofo/commit/4e19f032f2e837970a753b45bb0816f8aad12dd8))

## [0.6.2](https://github.com/vital-software/monofo/compare/v0.6.1...v0.6.2) (2020-07-01)


### Bug Fixes

* **pipeline:** use correct option when calling artifact ([b61e9a4](https://github.com/vital-software/monofo/commit/b61e9a4e2e681e6f17f5f7fbaec81c81c5d14d9b))

## [0.6.1](https://github.com/vital-software/monofo/compare/v0.6.0...v0.6.1) (2020-06-30)


### Bug Fixes

* prompt release after failed npm publish ([25064c5](https://github.com/vital-software/monofo/commit/25064c5803c914b3836552860c12f34c6884f794))

# [0.6.0](https://github.com/dominics/monofo/compare/v0.5.0...v0.6.0) (2020-06-30)


### Features

* add a run prefix to the artifact step ([46d53b8](https://github.com/dominics/monofo/commit/46d53b806fde037598f1fd8b250e071711322c15))

# [0.5.0](https://github.com/dominics/monofo/compare/v0.4.0...v0.5.0) (2020-06-30)


### Features

* perform artifact injection once at top of build ([6655df5](https://github.com/dominics/monofo/commit/6655df583f239a3f859c9a80f4bed6d631748829))


### Performance Improvements

* don't check the current build in artifact stage, we already know they're missing ([7d29001](https://github.com/dominics/monofo/commit/7d290017316ab72ea7f35200125bcfc5c34bc6a1))

# [0.4.0](https://github.com/dominics/monofo/compare/v0.3.1...v0.4.0) (2020-06-30)


### Features

* finish implementation of getSuitableDefaultBranchBuildAtOrBeforeCommit ([e950b93](https://github.com/dominics/monofo/commit/e950b935009fe43ee80b3f27d8b02b0bf8602fb9))

## [0.3.1](https://github.com/dominics/monofo/compare/v0.3.0...v0.3.1) (2020-06-29)


### Bug Fixes

* actually package built code ([0a71d5f](https://github.com/dominics/monofo/commit/0a71d5f694a90270836d27a60c65eb23666460f0))

# [0.3.0](https://github.com/dominics/monofo/compare/v0.2.0...v0.3.0) (2020-06-29)


### Bug Fixes

* fix the url for getting builds ([e0fb7d4](https://github.com/dominics/monofo/commit/e0fb7d4dc89b879de49f87691f0e6fed4a67e0da))


### Features

* implement artifact command with exec ([beaca53](https://github.com/dominics/monofo/commit/beaca5380d310a4a514be7942cd2163dfda633d6))

# [0.2.0](https://github.com/dominics/monofo/compare/v0.1.2...v0.2.0) (2020-06-28)


### Features

* added yargs CLI interface and some subcommands ([788ae73](https://github.com/dominics/monofo/commit/788ae7313fee03d5d1469c2502e5598f49c219c0))
* move to separate API client for buildkite ([d257735](https://github.com/dominics/monofo/commit/d257735f9355ab525c11db2ae398586008f17320))

## [0.1.2](https://github.com/dominics/monofo/compare/v0.1.1...v0.1.2) (2020-06-24)


### Bug Fixes

* **config:** skip pipelines with missing monorepo config ([3eb4ca8](https://github.com/dominics/monofo/commit/3eb4ca86b0bc5072799bc8ce091b81acaf390f6e))

## [0.1.1](https://github.com/dominics/monofo/compare/v0.1.0...v0.1.1) (2020-06-24)


### Bug Fixes

* **ci:** fix semantic release not updating changelog/package ([6ba9863](https://github.com/dominics/monofo/commit/6ba9863fd9281744ab2e1f6ccfe88be529ca8b77))

# Changelog

All notable changes to this project will be documented in this file.

### [0.0.2-0](https://github.com/dominics/monofo/compare/v0.0.1...v0.0.2-0) (2020-06-24)

### Bug Fixes

* remove npm-scripts-info ([aabf6bc](https://github.com/dominics/monofo/commit/aabf6bc7e1a9733188bcbef1463e5884dfc62d65))

### 0.0.1 (2020-06-23)
