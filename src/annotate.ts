import debug from 'debug';
import execa from 'execa';
import _ from 'lodash';
import Config from './config';

const log = debug('monofo:annotate');

function generateDetails(configs: Config[]): string {
  if (!configs.length) {
    return '';
  }

  const sortedConfigs = _.sortBy(configs, ['name', 'reason.reason']);

  const details = sortedConfigs
    .map((config) => {
      return `<tr><td>${config.monorepo.name}</td><td>${config.file.path}</td><td>${config.reason.toString()}</tr>`;
    })
    .join('');

  const includedString = sortedConfigs[0].included ? 'included' : 'excluded';

  return `
<details><summary>${configs.length} pipelines ${includedString}</summary>
<table><thead><tr><th>Pipeline</th><th>File</th><th>Reason</th></tr></thead>
<tbody>${details}</tbody></table></details>`;
}

function generateAnnotationContent(configs: Config[]): string {
  const [includedConfigs, excludedConfigs] = _.partition(configs, (item) => item.included);

  const title = `<h4>Monofo pipeline inclusions (${includedConfigs.length} incl/${configs.length} total)</h4>`;
  const includedDetails = generateDetails(includedConfigs);
  const excludedDetails = generateDetails(excludedConfigs);

  return `${title}${includedDetails}${excludedDetails}`;
}

async function sendAnnotation(body: string) {
  try {
    const response = await execa.command('buildkite-agent annotate --context=monofo --style=info', {
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
