import debug from 'debug';
import execa from 'execa';
import _ from 'lodash';
import Config from './config';
import { plurals } from './util';

const log = debug('monofo:annotate');

function generateDetails(configs: Config[]): string {
  if (!configs.length) {
    return '';
  }

  const sortedConfigs = _.sortBy(configs, ['name', 'reason.reason']);

  const details = sortedConfigs
    .map((config) => {
      return `<tr><td>${config.monorepo.name}</td>
<td>${config.file.path}</td><td>${config.reason.toString()}</td></tr>`;
    })
    .join('');

  const includedString = sortedConfigs[0].included ? 'included' : 'excluded';

  return `<h5>${configs.length} pipelines ${includedString}</h5>
<table><thead><tr><th>Pipeline</th><th>File</th><th>Because it has&hellip;</th></tr></thead>
<tbody>${details}</tbody></table>`;
}

function generateAnnotationContent(configs: Config[]): string {
  const [includedConfigs, excludedConfigs] = _.partition(configs, (item) => item.included);

  const includedDetails = generateDetails(includedConfigs);
  const excludedDetails = generateDetails(excludedConfigs);

  return `<details>
<summary>Build includes ${includedConfigs.length} matched pipeline${plurals(includedConfigs.length)}</summary>
${includedDetails}${excludedDetails}
</details>`;
}

async function sendAnnotation(body: string) {
  try {
    const response = await execa.command('buildkite-agent annotate --context=monofo', {
      input: body,
    });

    log(response);
  } catch (e) {
    log(e);
  }
}

export default async function sendBuildkiteAnnotation(configs: Config[]) {
  if (!configs.length) {
    return;
  }

  const content = generateAnnotationContent(configs);

  await sendAnnotation(content);
}
