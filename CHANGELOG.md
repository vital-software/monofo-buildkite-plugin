## [1.11.2](https://github.com/vital-software/monofo/compare/v1.11.1...v1.11.2) (2021-03-08)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.858.0 ([b14ddd5](https://github.com/vital-software/monofo/commit/b14ddd52e66eb92b19a0940669835418a0592268))
* **deps:** update dependency got to v11.8.2 ([11005a0](https://github.com/vital-software/monofo/commit/11005a09a1f643ffb8b9dbe41c3525b9c6829391))

## [1.11.1](https://github.com/vital-software/monofo/compare/v1.11.0...v1.11.1) (2021-03-08)


### Bug Fixes

* **deps:** update dependency js-yaml to v4 ([1146018](https://github.com/vital-software/monofo/commit/114601827dd9114e5a2e54c3c830d03422bcc477))

# [1.11.0](https://github.com/vital-software/monofo/compare/v1.10.3...v1.11.0) (2021-03-08)


### Bug Fixes

* **deps:** update dependency lodash to v4.17.21 ([8dbf21a](https://github.com/vital-software/monofo/commit/8dbf21ab43efa2b071506a89eeb7573cec0b4e96))


### Features

* support matches: false too ([d4bb208](https://github.com/vital-software/monofo/commit/d4bb208ae56a0a8f6b7d40010622e42a622414b3))
* **config:** don't list all matching files when matching everything ([fa2b3b9](https://github.com/vital-software/monofo/commit/fa2b3b9372b7543e779462d9edaf3a4b769ae11a))

## [1.10.3](https://github.com/vital-software/monofo/compare/v1.10.2...v1.10.3) (2021-02-04)


### Bug Fixes

* **deps:** update dependency js-yaml to v3.14.1 ([654b068](https://github.com/vital-software/monofo/commit/654b06866cd0765a2cae6208293fe902df87d01d))

## [1.10.2](https://github.com/vital-software/monofo/compare/v1.10.1...v1.10.2) (2021-02-03)


### Bug Fixes

* **deps:** update dependency debug to v4.3.1 ([1a8bb4b](https://github.com/vital-software/monofo/commit/1a8bb4bce16f3a38342eeb2199d63c0af2bb3b40))
* **deps:** update dependency got to v11.8.1 ([9d1c11e](https://github.com/vital-software/monofo/commit/9d1c11ef6e2ba10e19ad8f2f497556c9086526c4))
* **deps:** update dependency yargs to v16.2.0 ([3301b96](https://github.com/vital-software/monofo/commit/3301b964a677742d4659b78f55189d2d1ebf4ab7))

## [1.10.1](https://github.com/vital-software/monofo/compare/v1.10.0...v1.10.1) (2021-02-03)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.831.0 ([29ab158](https://github.com/vital-software/monofo/commit/29ab158f10ced19f62807e0d9769833e517d337a))

# [1.10.0](https://github.com/vital-software/monofo/compare/v1.9.4...v1.10.0) (2020-11-25)


### Features

* allow mixing PIPELINE_RUN_ALL and PIPELINE_NO_RUN ([421734c](https://github.com/vital-software/monofo/commit/421734c404f19f366036203f23d4846d9648488e))

## [1.9.4](https://github.com/vital-software/monofo/compare/v1.9.3...v1.9.4) (2020-11-24)


### Bug Fixes

* **decide:** change the order decisions are applied in ([43ed67f](https://github.com/vital-software/monofo/commit/43ed67fc81ff7d6b3ea71de5d48b9ee2bb56ec77))

## [1.9.3](https://github.com/vital-software/monofo/compare/v1.9.2...v1.9.3) (2020-11-12)


### Performance Improvements

* cache glob stat calls and limit hash concurrency ([4ff1077](https://github.com/vital-software/monofo/commit/4ff1077755770c054f44abc56e59465abccb08af))

## [1.9.2](https://github.com/vital-software/monofo/compare/v1.9.1...v1.9.2) (2020-11-12)


### Bug Fixes

* don't checksum dirs ([6a074f4](https://github.com/vital-software/monofo/commit/6a074f49f3bc1f6c6cc47caaebfca82627ad9a47))

## [1.9.1](https://github.com/vital-software/monofo/compare/v1.9.0...v1.9.1) (2020-11-12)


### Bug Fixes

* make decisions easier to read ([100c728](https://github.com/vital-software/monofo/commit/100c72809152721d2fc34bb60f6a31dbd2ab4129))

# [1.9.0](https://github.com/vital-software/monofo/compare/v1.8.0...v1.9.0) (2020-11-12)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.790.0 ([a571ba4](https://github.com/vital-software/monofo/commit/a571ba4d0ac2cbb69585c787d76d6562b43b8058))


### Features

* copy artifacts in parallel ([fbaa33e](https://github.com/vital-software/monofo/commit/fbaa33e245dfe7be31aa6e1f9d2962b454b373cd))

# [1.8.0](https://github.com/vital-software/monofo/compare/v1.7.0...v1.8.0) (2020-11-12)


### Bug Fixes

* make sure pipeline changes bust the cache ([7fae2a9](https://github.com/vital-software/monofo/commit/7fae2a95f86eb91a548f9e586d1edb68baec3d07))
* remove extra aliases on new commands ([140d0ac](https://github.com/vital-software/monofo/commit/140d0ac602745de635d138aaa35f870df14a68ff))


### Features

* add record-success step and command ([ce9590b](https://github.com/vital-software/monofo/commit/ce9590b0ae006af521bf838650185bdfdb3ae7e3))
* added install and uninstall commands to create a DynamoDB table ([f91c19c](https://github.com/vital-software/monofo/commit/f91c19c934b2b25ce54b93f60f7c35bc59b30955))
* configure ttl on table once it is ready ([8dc6ca2](https://github.com/vital-software/monofo/commit/8dc6ca2c2a62839ca5dcc56b7a9611b76c38277b))
* support multiple builds in the artifact injection step ([85bc752](https://github.com/vital-software/monofo/commit/85bc752cb2f7d768b8681dbcc89eb164e46a87db))
* use aws-cli to put-item the successful metadata ([2d452ad](https://github.com/vital-software/monofo/commit/2d452ad03bdd6e3310152d7fdf144b6b54f8514c))

# [1.8.0-alpha.2](https://github.com/vital-software/monofo/compare/v1.8.0-alpha.1...v1.8.0-alpha.2) (2020-11-12)


### Bug Fixes

* remove extra aliases on new commands ([baab610](https://github.com/vital-software/monofo/commit/baab6101e1808d5bd0cf95a9abbb28bb0b0de297))

# [1.8.0-alpha.1](https://github.com/vital-software/monofo/compare/v1.7.0...v1.8.0-alpha.1) (2020-11-12)


### Bug Fixes

* make sure pipeline changes bust the cache ([52a9cd2](https://github.com/vital-software/monofo/commit/52a9cd2b758f51f734818d8dff4e2b8e0c6d4dbf))


### Features

* add record-success step and command ([987d021](https://github.com/vital-software/monofo/commit/987d02196305a288a4a16a63a1fde7379de72e40))
* added install and uninstall commands to create a DynamoDB table ([5bf63cc](https://github.com/vital-software/monofo/commit/5bf63cc373d8e68456556aafdff5d51f28ba1787))
* configure ttl on table once it is ready ([10b34cd](https://github.com/vital-software/monofo/commit/10b34cd433b41dec2fcc3d135abf32dbb83d1002))
* support multiple builds in the artifact injection step ([7c67ffd](https://github.com/vital-software/monofo/commit/7c67ffd21154a70e888352610b57738e615aafd6))
* use aws-cli to put-item the successful metadata ([d692026](https://github.com/vital-software/monofo/commit/d692026e1828c1a9fa4ca8ae77da96546c26594c))

# [1.7.0](https://github.com/vital-software/monofo/compare/v1.6.1...v1.7.0) (2020-11-10)


### Features

* add PIPELINE_RUN_ONLY support ([3ab3cd6](https://github.com/vital-software/monofo/commit/3ab3cd6f953f0b4bf9bb3c048f5e38f7b764c830))

## [1.6.1](https://github.com/vital-software/monofo/compare/v1.6.0...v1.6.1) (2020-11-08)


### Bug Fixes

* replace all dashes ([6eef45e](https://github.com/vital-software/monofo/commit/6eef45e7d5e2486064f82f180b1657f02585a929))

# [1.6.0](https://github.com/vital-software/monofo/compare/v1.5.0...v1.6.0) (2020-11-02)


### Bug Fixes

* pre-sort configs by name, so they're location independent ([c9e7ed4](https://github.com/vital-software/monofo/commit/c9e7ed42694e99155d95601c2fca3b57587b1d05))


### Features

* **core:** allow overriding the name of a component in yaml ([0a8a6ac](https://github.com/vital-software/monofo/commit/0a8a6ac8256eba92274ef4ad0b3b9f0b2086b8e2))
* **core:** use glob to find pipeline files anywhere in the repo ([e086eea](https://github.com/vital-software/monofo/commit/e086eea3dcc2163b520fbb94b455162a01a8f2d0))

# [1.5.0](https://github.com/vital-software/monofo/compare/v1.4.0...v1.5.0) (2020-11-02)


### Features

* allow controlling included/excluded steps with PIPELINE_(NO_)RUN ([8e2a0e5](https://github.com/vital-software/monofo/commit/8e2a0e52fa251e8103bc8f7962842b7ccd2675fb))

# [1.4.0](https://github.com/vital-software/monofo/compare/v1.3.0...v1.4.0) (2020-11-02)


### Features

* **core:** allow setting env values when excluded ([d74d65e](https://github.com/vital-software/monofo/commit/d74d65e9e6f601caa0a9ce627ef3eaa692958a4a))

# [1.3.0](https://github.com/vital-software/monofo/compare/v1.2.0...v1.3.0) (2020-11-01)


### Features

* **core:** add support for depends_on causing pipelines to be included ([048122a](https://github.com/vital-software/monofo/commit/048122a5286d0b7a63f8c6f5f9b303a73a54fa1c))

# [1.2.0](https://github.com/vital-software/monofo/compare/v1.1.0...v1.2.0) (2020-10-30)


### Features

* **core:** always treat pipeline changes as matching that pipeline ([6b3d948](https://github.com/vital-software/monofo/commit/6b3d948bbb40fd82afff4e1f807fb86129f6ffac)), closes [#33](https://github.com/vital-software/monofo/issues/33)

# [1.1.0](https://github.com/vital-software/monofo/compare/v1.0.5...v1.1.0) (2020-10-30)


### Features

* **steps:** allow for phony dependencies ([1279f03](https://github.com/vital-software/monofo/commit/1279f037e267fbb34edeb107f3415c58266ec86e))

## [1.0.5](https://github.com/vital-software/monofo/compare/v1.0.4...v1.0.5) (2020-10-30)


### Bug Fixes

* **deps:** update dependency debug to v4.2.0 ([4e8099b](https://github.com/vital-software/monofo/commit/4e8099b4895a2a38699ced00b501e1df1a63d21e))

## [1.0.4](https://github.com/vital-software/monofo/compare/v1.0.3...v1.0.4) (2020-10-29)


### Bug Fixes

* **core:** replace depends_on with nothing if no artifact step is to be added ([8206195](https://github.com/vital-software/monofo/commit/8206195e32865aec5e258ae109eecd01045d353a))
* **deps:** update dependency got to v11.8.0 ([e1ed51c](https://github.com/vital-software/monofo/commit/e1ed51cb6e2b2a8d2423a53aeec303d9557b5ba3))

## [1.0.3](https://github.com/vital-software/monofo/compare/v1.0.2...v1.0.3) (2020-10-19)


### Bug Fixes

* flush changes to release ([b91c2fa](https://github.com/vital-software/monofo/commit/b91c2fa2895f84a4690bf243c99db4a8145a1701))

## [1.0.2](https://github.com/vital-software/monofo/compare/v1.0.1...v1.0.2) (2020-08-11)


### Bug Fixes

* **config:** include components that have no incoming edges ([de2c82e](https://github.com/vital-software/monofo/commit/de2c82eb452e8225468835a5757130f6395937a7))

## [1.0.1](https://github.com/vital-software/monofo/compare/v1.0.0...v1.0.1) (2020-07-03)


### Bug Fixes

* exclude blocked builds from consideration as base commit ([8452879](https://github.com/vital-software/monofo/commit/8452879edd543c864c04d2cf60daf8b93937786f))

# [1.0.0](https://github.com/vital-software/monofo/compare/v0.8.4...v1.0.0) (2020-07-01)


### Bug Fixes

* only include environment variables from included pipeline components ([6d14788](https://github.com/vital-software/monofo/commit/6d14788654bc1e83b7c437a3b31e25560d121949))


### BREAKING CHANGES

* We now only include environment variable from pipelines that have matching changes

## [0.8.4](https://github.com/vital-software/monofo/compare/v0.8.3...v0.8.4) (2020-07-01)


### Bug Fixes

* make error message on stale build more actionable ([8adb2de](https://github.com/vital-software/monofo/commit/8adb2de3761ec7a0aa0e882353c1743915213531))

## [0.8.3](https://github.com/vital-software/monofo/compare/v0.8.2...v0.8.3) (2020-07-01)


### Bug Fixes

* log merge-base step of diff algo ([9d9d09c](https://github.com/vital-software/monofo/commit/9d9d09c25d6c1fe84620f3a9a5782e8c8ea15cc8))

## [0.8.2](https://github.com/vital-software/monofo/compare/v0.8.1...v0.8.2) (2020-07-01)


### Bug Fixes

* also log the matching patterns ([320730b](https://github.com/vital-software/monofo/commit/320730bd43c307c1b50311ce6c7461efaf6e7b6d))

## [0.8.1](https://github.com/vital-software/monofo/compare/v0.8.0...v0.8.1) (2020-07-01)


### Bug Fixes

* output debugging information about matching and changed files ([8b74c59](https://github.com/vital-software/monofo/commit/8b74c5928a24d91974619c4207fcf14bec86b36f))

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

# [0.6.0](https://github.com/vital-software/monofo/compare/v0.5.0...v0.6.0) (2020-06-30)


### Features

* add a run prefix to the artifact step ([46d53b8](https://github.com/vital-software/monofo/commit/46d53b806fde037598f1fd8b250e071711322c15))

# [0.5.0](https://github.com/vital-software/monofo/compare/v0.4.0...v0.5.0) (2020-06-30)


### Features

* perform artifact injection once at top of build ([6655df5](https://github.com/vital-software/monofo/commit/6655df583f239a3f859c9a80f4bed6d631748829))


### Performance Improvements

* don't check the current build in artifact stage, we already know they're missing ([7d29001](https://github.com/vital-software/monofo/commit/7d290017316ab72ea7f35200125bcfc5c34bc6a1))

# [0.4.0](https://github.com/vital-software/monofo/compare/v0.3.1...v0.4.0) (2020-06-30)


### Features

* finish implementation of getSuitableDefaultBranchBuildAtOrBeforeCommit ([e950b93](https://github.com/vital-software/monofo/commit/e950b935009fe43ee80b3f27d8b02b0bf8602fb9))

## [0.3.1](https://github.com/vital-software/monofo/compare/v0.3.0...v0.3.1) (2020-06-29)


### Bug Fixes

* actually package built code ([0a71d5f](https://github.com/vital-software/monofo/commit/0a71d5f694a90270836d27a60c65eb23666460f0))

# [0.3.0](https://github.com/vital-software/monofo/compare/v0.2.0...v0.3.0) (2020-06-29)


### Bug Fixes

* fix the url for getting builds ([e0fb7d4](https://github.com/vital-software/monofo/commit/e0fb7d4dc89b879de49f87691f0e6fed4a67e0da))


### Features

* implement artifact command with exec ([beaca53](https://github.com/vital-software/monofo/commit/beaca5380d310a4a514be7942cd2163dfda633d6))

# [0.2.0](https://github.com/vital-software/monofo/compare/v0.1.2...v0.2.0) (2020-06-28)


### Features

* added yargs CLI interface and some subcommands ([788ae73](https://github.com/vital-software/monofo/commit/788ae7313fee03d5d1469c2502e5598f49c219c0))
* move to separate API client for buildkite ([d257735](https://github.com/vital-software/monofo/commit/d257735f9355ab525c11db2ae398586008f17320))

## [0.1.2](https://github.com/vital-software/monofo/compare/v0.1.1...v0.1.2) (2020-06-24)


### Bug Fixes

* **config:** skip pipelines with missing monorepo config ([3eb4ca8](https://github.com/vital-software/monofo/commit/3eb4ca86b0bc5072799bc8ce091b81acaf390f6e))

## [0.1.1](https://github.com/vital-software/monofo/compare/v0.1.0...v0.1.1) (2020-06-24)


### Bug Fixes

* **ci:** fix semantic release not updating changelog/package ([6ba9863](https://github.com/vital-software/monofo/commit/6ba9863fd9281744ab2e1f6ccfe88be529ca8b77))

# Changelog

All notable changes to this project will be documented in this file.

### [0.0.2-0](https://github.com/vital-software/monofo/compare/v0.0.1...v0.0.2-0) (2020-06-24)

### Bug Fixes

* remove npm-scripts-info ([aabf6bc](https://github.com/vital-software/monofo/commit/aabf6bc7e1a9733188bcbef1463e5884dfc62d65))

### 0.0.1 (2020-06-23)
