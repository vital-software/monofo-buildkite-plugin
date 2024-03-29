## [5.0.12](https://github.com/vital-software/monofo-buildkite-plugin/compare/v5.0.11...v5.0.12) (2022-06-01)


### Bug Fixes

* fixing failures when monofo runs on new pipelines ([6ceff63](https://github.com/vital-software/monofo-buildkite-plugin/commit/6ceff637ea75325a67cf88f14b82bdd438a2239a))

## [5.0.11](https://github.com/vital-software/monofo-buildkite-plugin/compare/v5.0.10...v5.0.11) (2022-05-13)


### Bug Fixes

* Allow for uuids up to version 7 ([f136eb1](https://github.com/vital-software/monofo-buildkite-plugin/commit/f136eb1abd9268c1fc51d0dbf2379771aee04d04))
* Point to isUuid fix commit in order to allow monofo buildkite pipeline to pass ([47e820b](https://github.com/vital-software/monofo-buildkite-plugin/commit/47e820b7350d2d2db0684a11237cda535b0f5322))

## [5.0.10](https://github.com/vital-software/monofo-buildkite-plugin/compare/v5.0.9...v5.0.10) (2022-05-04)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo ([f700cca](https://github.com/vital-software/monofo-buildkite-plugin/commit/f700cca108b06f113b25f0eaa65674a8ce65ea1a))
* **deps:** update dependency glob to v8 ([c560aff](https://github.com/vital-software/monofo-buildkite-plugin/commit/c560aff1515c088bba37090b8e56076676ddf5e9))
* **deps:** update oclif ([5081ca4](https://github.com/vital-software/monofo-buildkite-plugin/commit/5081ca4c898dfca0183162ec42b41727066178a0))

## [5.0.9](https://github.com/vital-software/monofo/compare/v5.0.8...v5.0.9) (2022-03-29)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([7c663e2](https://github.com/vital-software/monofo/commit/7c663e26b9deff0c42ca889a7a813d6d77ee7bba))

## [5.0.8](https://github.com/vital-software/monofo/compare/v5.0.7...v5.0.8) (2022-03-28)


### Bug Fixes

* **deps:** update dependency debug to v4.3.4 ([f36c5e8](https://github.com/vital-software/monofo/commit/f36c5e82b00b1a6df44339d3540d76a565d432fe))

## [5.0.7](https://github.com/vital-software/monofo/compare/v5.0.6...v5.0.7) (2022-03-23)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([ada5fc1](https://github.com/vital-software/monofo/commit/ada5fc1128b295e8661c5ed85fc455c67bf6106a))
* **deps:** update dependency tiny-async-pool to v1.3.0 ([f1d69a3](https://github.com/vital-software/monofo/commit/f1d69a33c322a7bb6a7c3b26b3cbaedd156c27b7))
* **deps:** update oclif ([622f59d](https://github.com/vital-software/monofo/commit/622f59df173dc759e762c217c0e24c3628cd786e))

## [5.0.6](https://github.com/vital-software/monofo/compare/v5.0.5...v5.0.6) (2022-03-14)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([2293b4b](https://github.com/vital-software/monofo/commit/2293b4b42e023e8a2820141d7de6b74411edb55c))

## [5.0.5](https://github.com/vital-software/monofo/compare/v5.0.4...v5.0.5) (2022-03-14)


### Bug Fixes

* **deps:** update dependency minimatch to v5 ([a3b1d19](https://github.com/vital-software/monofo/commit/a3b1d19682e58c413984b4ab2a6608f147bf4ecd))
* **deps:** update oclif ([cb6a13a](https://github.com/vital-software/monofo/commit/cb6a13a25ecc233f83048abadbd5bd707e9fc52b))

## [5.0.4](https://github.com/vital-software/monofo/compare/v5.0.3...v5.0.4) (2022-03-14)


### Bug Fixes

* **deps:** update dependency minimatch to v3.1.2 ([083905e](https://github.com/vital-software/monofo/commit/083905eb4b1749084d96f130aad543b59783d292))
* **deps:** update oclif ([8bb6594](https://github.com/vital-software/monofo/commit/8bb659425566f0ac1ea780c06ce9b6edd167771e))

## [5.0.3](https://github.com/vital-software/monofo/compare/v5.0.2...v5.0.3) (2022-03-06)


### Bug Fixes

* read group sub-step IDs as excluded as well, when a pipeline is skipped ([2567240](https://github.com/vital-software/monofo/commit/2567240fc18476c137f8f175b935210d948b6b71))

## [5.0.2](https://github.com/vital-software/monofo/compare/v5.0.1...v5.0.2) (2022-02-10)


### Bug Fixes

* Use the new oclif CLI ([ec0884c](https://github.com/vital-software/monofo/commit/ec0884ccdadbec9bdf1881926105c985f90bc66e))

## [5.0.1](https://github.com/vital-software/monofo/compare/v5.0.0...v5.0.1) (2022-02-10)


### Bug Fixes

* prompt a release after oclifv2 upgrade ([eed711d](https://github.com/vital-software/monofo/commit/eed711ddb7c9299b6d3155ace4ac0225fb90a618))

# [5.0.0](https://github.com/vital-software/monofo/compare/v4.0.6...v5.0.0) (2022-02-10)


### Features

* **pipeline:** removed the default command alias for pipeline ([4dcd6b5](https://github.com/vital-software/monofo/commit/4dcd6b53d783a4c60254f43ef42c1912e0509061))


### BREAKING CHANGES

* **pipeline:** If you called `npx monofo` before, you'll now need to
call `npx monofo pipeline` explicitly

## [4.0.6](https://github.com/vital-software/monofo/compare/v4.0.5...v4.0.6) (2022-02-10)


### Bug Fixes

* **deps:** update dependency minimatch to v3.0.5 ([186329c](https://github.com/vital-software/monofo/commit/186329c3f0dd7a095571761d9cb6f18a1e08c685))

## [4.0.5](https://github.com/vital-software/monofo/compare/v4.0.4...v4.0.5) (2022-02-09)


### Bug Fixes

* **deps:** update oclif ([41c9732](https://github.com/vital-software/monofo/commit/41c97321f5fbd3a69f1e09da46b3153d15b5c6cd))

## [4.0.4](https://github.com/vital-software/monofo/compare/v4.0.3...v4.0.4) (2022-02-09)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([d4d4ac0](https://github.com/vital-software/monofo/commit/d4d4ac09bf61f5fdf622a0afa5759ef277f43cd9))
* configure got timeouts in detail ([bada981](https://github.com/vital-software/monofo/commit/bada9810bf8ccd7fff0f26203c96dee16759f66d))

## [4.0.3](https://github.com/vital-software/monofo/compare/v4.0.2...v4.0.3) (2022-01-24)


### Bug Fixes

* **deps:** remove an unused dependency ([e0a680c](https://github.com/vital-software/monofo/commit/e0a680c91bda341e63500f30c942250ed9f337cc))

## [4.0.2](https://github.com/vital-software/monofo/compare/v4.0.1...v4.0.2) (2022-01-24)


### Bug Fixes

* **artifact:** error early on non-uuid build ID ([6909be6](https://github.com/vital-software/monofo/commit/6909be6d4d788bb5aaf919ec48d0d819ddd82d65))
* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([4255cc7](https://github.com/vital-software/monofo/commit/4255cc777bf74033039792f4b203964d46e7ea04))

## [4.0.1](https://github.com/vital-software/monofo/compare/v4.0.0...v4.0.1) (2022-01-21)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([3e7c960](https://github.com/vital-software/monofo/commit/3e7c9603a8cc8d854f4ad19b7c589f13f88a6c26))
* **hooks:** make plugin conf checks safe for nounset ([2645ca5](https://github.com/vital-software/monofo/commit/2645ca55dab7fd978b87d889e0802803bc5d58f4))

# [4.0.0](https://github.com/vital-software/monofo/compare/v3.8.1...v4.0.0) (2022-01-19)


### Bug Fixes

* calculate artifact name without pathname part ([0906954](https://github.com/vital-software/monofo/commit/090695492f8bae5f8ca850820eee1ae89add5295))
* use /tmp/ not /var/cache ([303e7ac](https://github.com/vital-software/monofo/commit/303e7acbb004eae718fe1341171ec5ad3c46fc3f))


* feat(compression)!: use .catar.caibx instead of .caidx for archiving ([c39424e](https://github.com/vital-software/monofo/commit/c39424e4def93bfdc9a182eb0db2f60c1b2a9f0d))


### Features

* add support for `desync chop` to fill the local cache on upload ([7714b36](https://github.com/vital-software/monofo/commit/7714b3693c5e81ada70a086706a57ebf622b06a6))
* after inflating, write artifacts to seed dir ([f3f5c7d](https://github.com/vital-software/monofo/commit/f3f5c7d9a3288fc6ffd6b62fc411c7e1ca710b4f))


### BREAKING CHANGES

* removed support for .caidx artifact compression

## [3.8.1](https://github.com/vital-software/monofo/compare/v3.8.0...v3.8.1) (2022-01-17)


### Bug Fixes

* only include config values when needed ([5df879b](https://github.com/vital-software/monofo/commit/5df879b76dc2e2c5fd379626454b21de14a7b2a9))
* use the default credential chain ([9bfd084](https://github.com/vital-software/monofo/commit/9bfd0847f212cd99c4124eaf556b2cce6b095b1e))

# [3.8.0](https://github.com/vital-software/monofo/compare/v3.7.2...v3.8.0) (2022-01-16)


### Bug Fixes

* check for empty file list ([4b60985](https://github.com/vital-software/monofo/commit/4b60985137a3ff5f6952f68740ece1527be51167))
* globs are recursive (because they can match directories) ([51bd769](https://github.com/vital-software/monofo/commit/51bd769bc08e29e31f3c34cb394ec5a91c401b4c))
* remember to push the final group ([3cd64d4](https://github.com/vital-software/monofo/commit/3cd64d43c5e968f594ebf5b4896b05040a39233c))


### Features

* output byte-size of artifact before upload ([39aebaa](https://github.com/vital-software/monofo/commit/39aebaa91e4cbb101313f4ff713a2d00014ac887))

## [3.7.2](https://github.com/vital-software/monofo/compare/v3.7.1...v3.7.2) (2022-01-15)


### Bug Fixes

* **deps:** update aws-sdk-js-v3 monorepo to v[secure] ([2a95eb3](https://github.com/vital-software/monofo/commit/2a95eb3603b3dd2a0d68bcd01a48c2ccef8b6e19))
* change between recursive and non-recursive each time ([d148f00](https://github.com/vital-software/monofo/commit/d148f00797ff1a45ec9c40d0384f7e21df4e59ba))
* still use GNU but pass non-recursion list of paths too ([75c716b](https://github.com/vital-software/monofo/commit/75c716bf55e9e7a902d45257db61b2a7b8a7d825))

## [3.7.1](https://github.com/vital-software/monofo/compare/v3.7.0...v3.7.1) (2022-01-12)


### Bug Fixes

* don't use --sort flag unless GNU tar >= 1.28 ([757ddfa](https://github.com/vital-software/monofo/commit/757ddfab3656e109be5a34a38da4924833da0e90))
* need to use a version comparison that supports two part versions ([b91f1a7](https://github.com/vital-software/monofo/commit/b91f1a72af5e9276029817e3aeb5b4641f275521))

# [3.7.0](https://github.com/vital-software/monofo/compare/v3.6.6...v3.7.0) (2022-01-12)


### Features

* depth sort rather than alphabetical ([8563ca5](https://github.com/vital-software/monofo/commit/8563ca5b1b6fd743a276f8559912fe8cbcd1862b))
* show tar version in use ([45cd9af](https://github.com/vital-software/monofo/commit/45cd9af32faf2123962e89b3fa4ce1f3656125b8))

## [3.6.6](https://github.com/vital-software/monofo/compare/v3.6.5...v3.6.6) (2022-01-12)


### Bug Fixes

* add --hard-dereference and --sort flags to tar ([21e5793](https://github.com/vital-software/monofo/commit/21e579396b0289490fde40a66b8dbb009c6892db))
* add an exec helper for better output ([1c2ab07](https://github.com/vital-software/monofo/commit/1c2ab07e2c47a62f0f26158c07d06939cdbc4cfb))
* enable for process.env.DEBUG if it exists ([aee7492](https://github.com/vital-software/monofo/commit/aee7492502cdb06e69826d074bbf20259fe83e42))
* sort file arguments to tar file-list ([bb90301](https://github.com/vital-software/monofo/commit/bb903014f3745a0b3e0c8ca7c3b1d4ba8f999033))

## [3.6.5](https://github.com/vital-software/monofo/compare/v3.6.4...v3.6.5) (2022-01-11)


### Bug Fixes

* set globs from variadic args ([3d51105](https://github.com/vital-software/monofo/commit/3d511059aab2171e32a6712b7feedd2be0744530))

## [3.6.4](https://github.com/vital-software/monofo/compare/v3.6.3...v3.6.4) (2022-01-11)


### Bug Fixes

* soft-fail errors in download as well as inflate ([298abe9](https://github.com/vital-software/monofo/commit/298abe95760032b7f9f9976c59089e71b957f485))

## [3.6.3](https://github.com/vital-software/monofo/compare/v3.6.2...v3.6.3) (2022-01-11)


### Bug Fixes

* set DEBUG when hook debug is set ([fe81318](https://github.com/vital-software/monofo/commit/fe8131818d58039230c3bf4f83a334bf68ecc517))

## [3.6.2](https://github.com/vital-software/monofo/compare/v3.6.1...v3.6.2) (2022-01-11)


### Bug Fixes

* log the generated monofo command ([0be0593](https://github.com/vital-software/monofo/commit/0be0593d5db0f3ea95eda8f3632781047aa59481))
* provide specific messaging about boolean matches ([c014963](https://github.com/vital-software/monofo/commit/c014963cd763162f31bfb9f0b5b058e844778972))

## [3.6.1](https://github.com/vital-software/monofo/compare/v3.6.0...v3.6.1) (2022-01-11)


### Bug Fixes

* support single-string version of download property ([88524bc](https://github.com/vital-software/monofo/commit/88524bca51ac5202f04ec6d01a6fd18b0ef7e692))

# [3.6.0](https://github.com/vital-software/monofo/compare/v3.5.3...v3.6.0) (2022-01-10)


### Features

* allow `matches: true` to opt out of PIPELINE_RUN_ONLY ([aaa18dd](https://github.com/vital-software/monofo/commit/aaa18dd44f150356103be3d5ce8f85b119a2a2d9))

## [3.5.3](https://github.com/vital-software/monofo/compare/v3.5.2...v3.5.3) (2022-01-10)


### Bug Fixes

* show the correct inflate arguments ([10a5596](https://github.com/vital-software/monofo/commit/10a559653cf05773e2accc7582b991edcb5f9142))

## [3.5.2](https://github.com/vital-software/monofo/compare/v3.5.1...v3.5.2) (2022-01-10)


### Bug Fixes

* rimraf the config dir on process exit ([4fbe6e3](https://github.com/vital-software/monofo/commit/4fbe6e37ab55b8b90025868e7f8c6773dcfd245d))

## [3.5.1](https://github.com/vital-software/monofo/compare/v3.5.0...v3.5.1) (2022-01-10)


### Bug Fixes

* allow deflate to control how output is written ([c3dd399](https://github.com/vital-software/monofo/commit/c3dd399058cd7f98473172f93e749b80bf624214))
* use verbose flag ([5fab7fd](https://github.com/vital-software/monofo/commit/5fab7fdb431aa15a461f6b0305f237e867894aa5))
* write a config file as well as a credentials file ([a78d5b1](https://github.com/vital-software/monofo/commit/a78d5b17399c17beccf2157a253489734a4bebd0))

# [3.5.0](https://github.com/vital-software/monofo/compare/v3.4.4...v3.5.0) (2022-01-10)


### Bug Fixes

* add more logging of instance metadata process ([dafa3c7](https://github.com/vital-software/monofo/commit/dafa3c7ffd3f93ae7590e865ea5c5188013f54ba))
* load instance profile credentials if needed ([fda1cfc](https://github.com/vital-software/monofo/commit/fda1cfc00b20101d57a0a182510b9cb569b36e8f))


### Features

* convert to aws-sdk v3 ([e6ec251](https://github.com/vital-software/monofo/commit/e6ec251f17115448831ff1599e50fb1653b9a5bb))

## [3.4.4](https://github.com/vital-software/monofo/compare/v3.4.3...v3.4.4) (2022-01-10)


### Bug Fixes

* better logging around checking directories and config files ([981f75f](https://github.com/vital-software/monofo/commit/981f75faeab91207bddeea871cc2a8ec6eb6e857))

## [3.4.3](https://github.com/vital-software/monofo/compare/v3.4.2...v3.4.3) (2022-01-09)


### Bug Fixes

* add support for STS credentials via config file ([2ba3caa](https://github.com/vital-software/monofo/commit/2ba3caa4903dae17714d40fc588d84ff93e50aa4))

## [3.4.2](https://github.com/vital-software/monofo/compare/v3.4.1...v3.4.2) (2022-01-07)


### Bug Fixes

* only store to single store during tar ([3c97f54](https://github.com/vital-software/monofo/commit/3c97f5462c8fae8499069a5eef42d99b95873911))

## [3.4.1](https://github.com/vital-software/monofo/compare/v3.4.0...v3.4.1) (2022-01-07)


### Bug Fixes

* check enabled before inflating too ([1cf0ede](https://github.com/vital-software/monofo/commit/1cf0edeac4bc32116b7227c0c6a56b4121e2bef7))

# [3.4.0](https://github.com/vital-software/monofo/compare/v3.3.7...v3.4.0) (2022-01-07)


### Bug Fixes

* specify bash as the shell, so we can always use pipefail ([ce7c39b](https://github.com/vital-software/monofo/commit/ce7c39bf30aadc4cd207eccfea2d9b19d32f32c4))


### Features

* create store/cache directories locally if they don't already exist ([c5ead64](https://github.com/vital-software/monofo/commit/c5ead6400dd387a34f89c5b4d25a38b85591fd71))

## [3.3.7](https://github.com/vital-software/monofo/compare/v3.3.6...v3.3.7) (2022-01-07)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-not-found to v2.2.4 ([d53319a](https://github.com/vital-software/monofo/commit/d53319a62d2b493596207cde02dccf9d1cb00e74))

## [3.3.6](https://github.com/vital-software/monofo/compare/v3.3.5...v3.3.6) (2022-01-07)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-autocomplete to v1.1.1 ([ddf5906](https://github.com/vital-software/monofo/commit/ddf5906a0402b7a1d492b4ee9aa0e70bcc46e526))
* **deps:** update dependency @oclif/plugin-which to v2.0.5 ([ae5a06b](https://github.com/vital-software/monofo/commit/ae5a06b36cf9bcd807b4ac7ad204daf97710b6f1))

## [3.3.5](https://github.com/vital-software/monofo/compare/v3.3.4...v3.3.5) (2022-01-07)


### Bug Fixes

* incorrect order of tar operations ([f9e78a1](https://github.com/vital-software/monofo/commit/f9e78a17a92b4e3315a1ec3dcd309688dc9d6d69))
* make deflate operations return child process ([b014023](https://github.com/vital-software/monofo/commit/b014023068888e6e9481a79a54c0404cd045ea8d))

## [3.3.4](https://github.com/vital-software/monofo/compare/v3.3.3...v3.3.4) (2022-01-06)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-autocomplete to v1.1.0 ([beef68d](https://github.com/vital-software/monofo/commit/beef68d53df6f1aa994cde3f4707dc154e8c9e0a))

## [3.3.3](https://github.com/vital-software/monofo/compare/v3.3.2...v3.3.3) (2022-01-06)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-help to v5 ([4f8e315](https://github.com/vital-software/monofo/commit/4f8e315e7f6b2f768316e5848df516c62d6bbc90))

## [3.3.2](https://github.com/vital-software/monofo/compare/v3.3.1...v3.3.2) (2022-01-05)


### Bug Fixes

* **deps:** update dependency @oclif/command to v1.8.16 ([d798ad1](https://github.com/vital-software/monofo/commit/d798ad1ec824335fbf8e58ce11b946f4d400e06b))
* **deps:** update dependency @oclif/plugin-help to v3.3.1 ([904c6d3](https://github.com/vital-software/monofo/commit/904c6d368e509a96ba1117ccc122d655cd892ac5))
* **deps:** update dependency @oclif/plugin-which to v2.0.4 ([56e3614](https://github.com/vital-software/monofo/commit/56e36140f0ce314b365c2b1c8787cd8a28a5d6e4))
* **deps:** update dependency aws-sdk to v2.1051.0 ([9e3d220](https://github.com/vital-software/monofo/commit/9e3d2201abbf346e2cccb4f000897b932ab86dce))

## [3.3.1](https://github.com/vital-software/monofo/compare/v3.3.0...v3.3.1) (2021-12-15)


### Bug Fixes

* use correct expected file extension for caidx ([eaf66f8](https://github.com/vital-software/monofo/commit/eaf66f81df34d207d494a9ef28318d65f1874955))
* **deps:** update dependency @oclif/plugin-not-found to v2 ([774b677](https://github.com/vital-software/monofo/commit/774b677988d49c04aa2bd436076e478904ed1134))
* **deps:** update dependency @oclif/plugin-which to v2 ([4302ae7](https://github.com/vital-software/monofo/commit/4302ae79d520e67791efe5d3b6e7209c97a8f78a))

# [3.3.0](https://github.com/vital-software/monofo/compare/v3.2.4...v3.3.0) (2021-12-15)


### Bug Fixes

* defensively ensure steps is an array ([8b269ef](https://github.com/vital-software/monofo/commit/8b269ef892394e0cbc75192008062fa518e13ce0))


### Features

* support using monofo as the configuration object name ([ff34090](https://github.com/vital-software/monofo/commit/ff340903d9e4d8d69e3eeceb996894a67bf919c9))

## [3.2.4](https://github.com/vital-software/monofo/compare/v3.2.3...v3.2.4) (2021-12-15)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-autocomplete to v1 ([72e1d31](https://github.com/vital-software/monofo/commit/72e1d31da4701bd827a25f47e1cc9fc0f475b22b))
* **deps:** update dependency @oclif/plugin-not-found to v1.2.6 ([31ef233](https://github.com/vital-software/monofo/commit/31ef23328dc1b4ba3748770190f2322dbb88d2f3))

## [3.2.3](https://github.com/vital-software/monofo/compare/v3.2.2...v3.2.3) (2021-12-15)


### Bug Fixes

* give more context about why a compression was disabled ([914e177](https://github.com/vital-software/monofo/commit/914e17706f6107a5ef1e8d20d6060cc9a6dce589))
* use --quiet flag to npx too ([ccb9bf6](https://github.com/vital-software/monofo/commit/ccb9bf6f7456614f3ef0a72b68e9c80e0ae36aa4))
* use `-s sh` option to npx ([d183013](https://github.com/vital-software/monofo/commit/d18301342bc2b4ffe10e920876839767bfd683ed))

## [3.2.2](https://github.com/vital-software/monofo/compare/v3.2.1...v3.2.2) (2021-12-14)


### Bug Fixes

* update expected list of file extensions ([fcebbdc](https://github.com/vital-software/monofo/commit/fcebbdcaf9700574fae518bdc3b27b9627efde64))

## [3.2.1](https://github.com/vital-software/monofo/compare/v3.2.0...v3.2.1) (2021-12-14)


### Bug Fixes

* replace broken version in the run.bash lib ([b8e35fe](https://github.com/vital-software/monofo/commit/b8e35fe5bcb28ba49c6afcf59b32ed4cb45b4b80))

# [3.2.0](https://github.com/vital-software/monofo/compare/v3.1.4...v3.2.0) (2021-12-14)


### Bug Fixes

* **hooks:** add missing download keyword ([4c7d852](https://github.com/vital-software/monofo/commit/4c7d852c746a7c59408002028faf4bad5f516d3f))


### Features

* added deflate command ([17fe0f8](https://github.com/vital-software/monofo/commit/17fe0f8e67b093c35484b6a475940fc127aadb08))
* **core:** move artifact hooks into monofo ([4175ffc](https://github.com/vital-software/monofo/commit/4175ffc5a9fb5ee33b3833ee5132d3a863bbdbe7))

## [3.1.4](https://github.com/vital-software/monofo/compare/v3.1.3...v3.1.4) (2021-12-08)


### Bug Fixes

* **core:** fix incorrect bin reference ([693f333](https://github.com/vital-software/monofo/commit/693f3338a69b5106da4ef663f0e74efe4000d09d))

## [3.1.3](https://github.com/vital-software/monofo/compare/v3.1.2...v3.1.3) (2021-12-08)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-help to v3.2.14 ([c8a1f05](https://github.com/vital-software/monofo/commit/c8a1f055c019148795db8495f056282b6e337e2b))

## [3.1.2](https://github.com/vital-software/monofo/compare/v3.1.1...v3.1.2) (2021-12-08)


### Bug Fixes

* **deps:** update dependency @oclif/plugin-not-found to v1.2.5 ([ac0171d](https://github.com/vital-software/monofo/commit/ac0171d6ae9733d557d0b1e2b05b97d1bab9a1d5))

## [3.1.1](https://github.com/vital-software/monofo/compare/v3.1.0...v3.1.1) (2021-12-07)


### Bug Fixes

* **deps:** update dependency @oclif/command to v1.8.9 ([4c0b295](https://github.com/vital-software/monofo/commit/4c0b295b67be74c39d897393b9c28a5f600d14ef))
* **deps:** update dependency @oclif/config to v1.18.2 ([553a3da](https://github.com/vital-software/monofo/commit/553a3da9ca159fe7b7607d2daef82d4dc9761859))
* **deps:** update dependency @oclif/plugin-help to v3.2.13 ([502030b](https://github.com/vital-software/monofo/commit/502030bd457c367a9a3a24509e1adddab9655174))

# [3.1.0](https://github.com/vital-software/monofo/compare/v3.0.3...v3.1.0) (2021-12-07)


### Features

* change to oclif instead of yargs ([fa215dc](https://github.com/vital-software/monofo/commit/fa215dc60303de9778273cac0f33794d84330526))

## [3.0.3](https://github.com/vital-software/monofo/compare/v3.0.2...v3.0.3) (2021-12-06)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.1044.0 ([1382901](https://github.com/vital-software/monofo/commit/1382901685333f06ce48941c32226283257542bb))

## [3.0.2](https://github.com/vital-software/monofo/compare/v3.0.1...v3.0.2) (2021-12-06)


### Bug Fixes

* **deps:** update dependency yargs to v17.3.0 ([fe97188](https://github.com/vital-software/monofo/commit/fe97188e83d952a9c32df53aeff80bdc5d6b8345))
* **hooks:** fix a stray colon in the replacement string ([1839944](https://github.com/vital-software/monofo/commit/1839944a844782823ac54d3381186490fcb293a6))
* **import:** use esinterop syntax for loading command module ([ffec8d3](https://github.com/vital-software/monofo/commit/ffec8d3ddf40e06ce941eb3e1e62462c246ff188))
* **types:** merge execSync from one branch with new command types from other ([4c66927](https://github.com/vital-software/monofo/commit/4c66927ecd5dc9c71bc5e1afa9ea71e2a4875b45))

## [3.0.1](https://github.com/vital-software/monofo/compare/v3.0.0...v3.0.1) (2021-11-29)


### Bug Fixes

* **deps:** update dependency debug to v4.3.3 ([dccb9b8](https://github.com/vital-software/monofo/commit/dccb9b842ce7c4cd836c816bc946cdd4e24bbbaf))

# [3.0.0](https://github.com/vital-software/monofo/compare/v2.1.1...v3.0.0) (2021-11-24)


### Features

* add a plugin configuration for generating pipelines ([b51b173](https://github.com/vital-software/monofo/commit/b51b173eca7aadd16c837c4ff789175773054d23))
* drop support for node 12 ([b99ceb4](https://github.com/vital-software/monofo/commit/b99ceb440769922113a71b0f132e7375129d3364))


### BREAKING CHANGES

* Node 12 is no longer supported

## [2.1.1](https://github.com/vital-software/monofo/compare/v2.1.0...v2.1.1) (2021-11-24)


### Bug Fixes

* **pure:** JSON stringify the commands so that if they're an array we still get them all ([0cc91ff](https://github.com/vital-software/monofo/commit/0cc91ff56fb4bf7654687c7982961d581a915a48))

# [2.1.0](https://github.com/vital-software/monofo/compare/v2.0.3...v2.1.0) (2021-11-23)


### Features

* **config-file:** Allow customizing PIPELINE_FILE_GLOB ([c095f39](https://github.com/vital-software/monofo/commit/c095f39563e3db38e8edb6b656c611f58228e9ac))

## [2.0.3](https://github.com/vital-software/monofo/compare/v2.0.2...v2.0.3) (2021-11-23)


### Bug Fixes

* **deps:** update dependency got to v11.8.3 ([51cd1f8](https://github.com/vital-software/monofo/commit/51cd1f8aaf840d30afb1db37ecd5257af3475365))
* **diff:** fix integration strategy to check for existing commits with cat-file ([b6b1c15](https://github.com/vital-software/monofo/commit/b6b1c151bb1dad279f4a53bbe980ddd24e096a5f))

## [2.0.2](https://github.com/vital-software/monofo/compare/v2.0.1...v2.0.2) (2021-11-10)


### Bug Fixes

* **diff:** look through more commits to find a base build, including second parents ([6b48883](https://github.com/vital-software/monofo/commit/6b488839770f451fc0ed72c70ae7d20e2719da7d))
* **diff:** reverse order of logic to allow integration builds ([1e4ccd5](https://github.com/vital-software/monofo/commit/1e4ccd5a7155a17ff2675bd3437456b1c331ebd8)), closes [#262](https://github.com/vital-software/monofo/issues/262)

## [2.0.1](https://github.com/vital-software/monofo/compare/v2.0.0...v2.0.1) (2021-11-02)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.1019.0 ([be34f13](https://github.com/vital-software/monofo/commit/be34f13236217b11253c8e51b7aa47908cfa5afc))

# [2.0.0](https://github.com/vital-software/monofo/compare/v1.19.1...v2.0.0) (2021-10-31)


### Bug Fixes

* **decide:** branch list exclusion wins over fallback ([7f6baf7](https://github.com/vital-software/monofo/commit/7f6baf7d7b35a129b10ac5039b8f0cf6d58d4fa5))


### BREAKING CHANGES

* **decide:** Order of decision is changed

## [1.19.1](https://github.com/vital-software/monofo/compare/v1.19.0...v1.19.1) (2021-10-27)


### Bug Fixes

* **core:** fix annotation sort by name ([300a264](https://github.com/vital-software/monofo/commit/300a264204d2edd6a0641b09a5b5d2ba1548c721))

# [1.19.0](https://github.com/vital-software/monofo/compare/v1.18.0...v1.19.0) (2021-10-27)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.1015.0 ([142942a](https://github.com/vital-software/monofo/commit/142942a402447111440c01bccc2974bf3fb907bf))


### Features

* **core:** Add Buildkite annotation saying what is included/excluded ([c4b9b2f](https://github.com/vital-software/monofo/commit/c4b9b2f7af6b6cb9fc3b5a320e33a9caa5b28722))
* **core:** include MONOFO_BASE_BUILD_COMMIT in merged env vars ([5661925](https://github.com/vital-software/monofo/commit/5661925be46ed95d02cacb4eae09e108361ca55d))

# [1.18.0](https://github.com/vital-software/monofo/compare/v1.17.4...v1.18.0) (2021-10-19)


### Features

* **config:** add pattern matching for branch inclusion/exclusion ([79ad2ad](https://github.com/vital-software/monofo/commit/79ad2ade21ffbb894ad5f509dedeecb002ff4ad4))

## [1.17.4](https://github.com/vital-software/monofo/compare/v1.17.3...v1.17.4) (2021-09-28)


### Bug Fixes

* **deps:** update dependency yargs to v17.2.1 ([a643ddc](https://github.com/vital-software/monofo/commit/a643ddce9923e960d55c1eb9bd7beefca07595e2))

## [1.17.3](https://github.com/vital-software/monofo/compare/v1.17.2...v1.17.3) (2021-09-24)


### Bug Fixes

* **deps:** update dependency glob to v7.2.0 ([9cc932e](https://github.com/vital-software/monofo/commit/9cc932e481571b1f6aa9aa0d66d18639046a62c9))
* **deps:** update dependency yargs to v17.2.0 ([12e0499](https://github.com/vital-software/monofo/commit/12e0499dc21f3848c2e24b16f6fbf110b9c93114))

## [1.17.2](https://github.com/vital-software/monofo/compare/v1.17.1...v1.17.2) (2021-09-02)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.981.0 ([2882dc7](https://github.com/vital-software/monofo/commit/2882dc76ac38b10c4acbf74e8f910975d8d0c41c))
* **deps:** update dependency chalk to v4.1.2 ([9948121](https://github.com/vital-software/monofo/commit/99481213bf19bfde88c163ed6cf9a7880a2fdb13))
* **deps:** update dependency debug to v4.3.2 ([f80b1da](https://github.com/vital-software/monofo/commit/f80b1dab59f5247a539c003090e48fbc263894e8))
* **deps:** update dependency yargs to v17.1.1 ([b66014b](https://github.com/vital-software/monofo/commit/b66014b064d0aedc3dfa0e486d49753e86a39b83))

## [1.17.1](https://github.com/vital-software/monofo/compare/v1.17.0...v1.17.1) (2021-06-23)


### Bug Fixes

* **client:** fix url parameter mistakes that lead to filtering by branch not working ([56b1a4f](https://github.com/vital-software/monofo/commit/56b1a4f03b9c5122d7088ba3b40d2bcb4754b775))
* **diff:** use the correct name in default branch log message ([3c9cc36](https://github.com/vital-software/monofo/commit/3c9cc367c618b14dbf5a620269aaccc50c702a37))

# [1.17.0](https://github.com/vital-software/monofo/compare/v1.16.7...v1.17.0) (2021-06-22)


### Bug Fixes

* **config:** for matchesAll, it doesn't matter if there are no changes ([1917026](https://github.com/vital-software/monofo/commit/19170266201f99626efd5c8c129b8fde1b674a02))


### Features

* implement more lenient approach for integration branches ([ead3de6](https://github.com/vital-software/monofo/commit/ead3de6e9ebad7603bd6296f2aa02fa9d5462604))
* support multiple branches in Buildkite client ([63ec31b](https://github.com/vital-software/monofo/commit/63ec31b335075226d65e5aad5997f787dbecb556))

## [1.16.7](https://github.com/vital-software/monofo/compare/v1.16.6...v1.16.7) (2021-06-21)


### Bug Fixes

* use newer async interface for yargs ([f4e5c02](https://github.com/vital-software/monofo/commit/f4e5c024e70e744fc083c6073e3295664a3b65d9))

## [1.16.6](https://github.com/vital-software/monofo/compare/v1.16.5...v1.16.6) (2021-06-16)


### Bug Fixes

* **config:** fallback for never-matched tasks should be excluded, not included ([41fe694](https://github.com/vital-software/monofo/commit/41fe694bbd4f4675a8f0ce5d6dc931a72a613b20))

## [1.16.5](https://github.com/vital-software/monofo/compare/v1.16.4...v1.16.5) (2021-06-03)


### Bug Fixes

* **artifact:** remove the artifact being retransmitted from the local fs ([6c24465](https://github.com/vital-software/monofo/commit/6c24465f137eb7398b30397444623c9b9d101065))
* **deps:** update dependency aws-sdk to v2.920.0 ([715ca2e](https://github.com/vital-software/monofo/commit/715ca2ebc5d77258f64c98436d4b7581e1f0b643))

## [1.16.4](https://github.com/vital-software/monofo/compare/v1.16.3...v1.16.4) (2021-05-13)


### Bug Fixes

* **deps:** update dependency yargs to v17 ([0d4e062](https://github.com/vital-software/monofo/commit/0d4e062a5752c24dce74b34d0cae8883ee0b670b))

## [1.16.3](https://github.com/vital-software/monofo/compare/v1.16.2...v1.16.3) (2021-05-13)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.906.0 ([416d08c](https://github.com/vital-software/monofo/commit/416d08cf7cbe0042d79275a0cffe1f7db8663577))

## [1.16.2](https://github.com/vital-software/monofo/compare/v1.16.1...v1.16.2) (2021-05-13)


### Bug Fixes

* **deps:** update dependency glob to v7.1.7 ([aeaf374](https://github.com/vital-software/monofo/commit/aeaf374cd2f5e1ccd76ab95d78f85fe32f0b14fe))

## [1.16.1](https://github.com/vital-software/monofo/compare/v1.16.0...v1.16.1) (2021-04-28)


### Bug Fixes

* **deps:** update dependency chalk to v4.1.1 ([537904c](https://github.com/vital-software/monofo/commit/537904c3e00d9259eca6aee4f1486b7f35fc5161))

# [1.16.0](https://github.com/vital-software/monofo/compare/v1.15.0...v1.16.0) (2021-04-28)


### Features

* **config:** print warning log when invalid attributes are found ([5aeb364](https://github.com/vital-software/monofo/commit/5aeb3646c0df5d2ad2e59472bf92a444b0ed0b69)), closes [#188](https://github.com/vital-software/monofo/issues/188)

# [1.15.0](https://github.com/vital-software/monofo/compare/v1.14.0...v1.15.0) (2021-04-28)


### Features

* **config:** allow overriding the default branch via MONOFO_DEFAULT_BRANCH ([3ebcafb](https://github.com/vital-software/monofo/commit/3ebcafbc6b093961bfd3419275df0b3eddc4f0d4)), closes [#201](https://github.com/vital-software/monofo/issues/201)

# [1.14.0](https://github.com/vital-software/monofo/compare/v1.13.0...v1.14.0) (2021-04-21)


### Features

* **config:** make matches: false ignore self-changes to its pipeline ([ca4dbda](https://github.com/vital-software/monofo/commit/ca4dbda563177892f62c3f68bad91e06a3c23649)), closes [#198](https://github.com/vital-software/monofo/issues/198)
* **decide:** also use matches === false to opt out of PIPELINE_RUN_ALL ([f45541e](https://github.com/vital-software/monofo/commit/f45541e7c67898024fae1b9c133241a0b7dc20fb)), closes [#195](https://github.com/vital-software/monofo/issues/195)

# [1.13.0](https://github.com/vital-software/monofo/compare/v1.12.0...v1.13.0) (2021-04-20)


### Bug Fixes

* **deps:** update dependency aws-sdk to v2.889.0 ([b7fb4a5](https://github.com/vital-software/monofo/commit/b7fb4a5b34c24038293f85c30b8aa70a8d0cd103))
* **deps:** update dependency js-yaml to v4.1.0 ([5cc245a](https://github.com/vital-software/monofo/commit/5cc245a53fe78061549f0fb4d7eaafd0083fffaf))


### Features

* **core:** set MONOFO_BASE_BUILD_ID env var ([2c43a0a](https://github.com/vital-software/monofo/commit/2c43a0a0b8c3ec210544516745d4a705dcfdde4d)), closes [#158](https://github.com/vital-software/monofo/issues/158)

# [1.12.0](https://github.com/vital-software/monofo/compare/v1.11.2...v1.12.0) (2021-03-08)


### Features

* add commands to list and hash components ([a894b1b](https://github.com/vital-software/monofo/commit/a894b1bbf6cc0d08f0a8fec2cc3b600b5ac13e43))

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
