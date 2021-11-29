import { Arguments, Argv, CommandModule } from 'yargs';
import _ from 'lodash';
import debug from 'debug';
import { AgentOutput, download } from '../buildkite/agent';

const log = debug('monofo:cmd:artifact');

function getTasks(artifact: string, additionalBuilds: string[] = []): (() => Promise<AgentOutput>)[] {
  log(`Getting tasks to download artifact ${artifact} from ${additionalBuilds.join(', ')}`);
  return additionalBuilds.map((b: string) => () => download(artifact, artifact, b));
}

function downloadArtifact(artifact: string, additionalBuilds: string[] = []): Promise<void> {
  return getTasks(artifact, additionalBuilds)
    .reduce((promiseChain: Promise<AgentOutput>, currentTask: () => Promise<AgentOutput>) => {
      return promiseChain.catch(currentTask);
    }, Promise.reject())
    .then((out: AgentOutput) =>
      log(`Successfully downloaded ${artifact}:\n\bOutput:\n${out.stdout}\n\nError output:\n${out.stderr}\n`)
    );
}

const cmd: CommandModule<CommonArguments, ArtifactArguments> = {
  command: 'artifact <artifacts...>',
  describe: `Ensures artifacts are present by injecting them from other builds if necessary`,
  builder: (yargs: Argv<CommonArguments>) => {
    return yargs
      .options({
        build: {
          demandOption: true,
          type: 'string',
          describe:
            'A build ID (UUID) to look within for the named artifacts. ' +
            'May be specified multiple times, in which case the builds will be checked in order.',
        },
      })
      .positional('artifacts', {
        array: true,
        type: 'string',
        describe: 'A list of artifact files to retrieve',
        demandOption: true,
      });
  },

  async handler(args: Arguments<ArtifactArguments>): Promise<void> {
    const builds = _.isArray(args.build) ? args.build : [args.build];
    const artifacts = _.isArray(args.artifacts) ? args.artifacts : [args.artifacts];
    return Promise.all(artifacts.map((artifact) => downloadArtifact(artifact, builds))).then(() => undefined);
  },
};

export = cmd;
