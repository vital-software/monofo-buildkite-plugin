## Content-based build skipping (`pure`)

You can mark a pipeline as pure by setting the `pure` flag to `true` -
this indicates that it doesn't have side-effects other than producing its
artifacts, and the only inputs it relies on are listed in its `matches`.

Doing so enables an extra layer of caching, based on the contents of the input
files.

```yaml
monorepo:
  pure: true
  matches:
    - package.json
    - yarn.lock
  produces: node-modules.tar.lz4

steps:
  - commands:
      - yarn install
      - find . -type d -name node_modules -prune -print0 > node-modules.list
    plugins:
      - vital-software/monofo#v3.4.1:
          upload:
            node-modules.tar.lz4:
              filesFrom: node-modules.list
              null:      true
```

When this build finishes, the contents of `package.json` and `yarn.lock` will be
hashed.

In any future build, if those files have the same content, instead of running
the `yarn install` command step, `node-modules.tar` will be directly downloaded
from the last build that produced it successfully (and injected with the other
artifacts at the start of the build)

Pure mode uses external metadata to be able to reuse artifacts from previous
builds efficiently. Content hash to build ID mappings are stored in
DynamoDB, so if you are using pure mode you will need to do some additional
configuration.

### DynamoDB setup

DynamoDB setup is only required if you're intending to use [pure mode](docs/pure.md#dynamodb-setup)

For starters, you'll need to run `monofo` as a user that can read and write to
the `monofo_cache_metadata` DynamoDB table. How to do this depends on your
own Buildkite stack, but you'd generally attach a policy that looks like this
to the Buildkite role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MonofoCacheMetadataAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:DeleteTable",
        "dynamodb:CreateTable",
        "dynamodb:BatchGetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/monofo_cache_metadata"
    }
  ]
}
```

Then you should create the DynamoDB table so that it's ready for use. To do
this, you can use `monofo install` to create the needed table (and
`monofo uninstall` to remove it again should you need to). Finally, you can test
writing to the DynamoDB table using the `monofo record-success` command.
