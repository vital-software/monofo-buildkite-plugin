#!/usr/bin/env node

import { getConfig } from './config';

export async function main() {
  console.log('Getting config');
  console.log(await getConfig());
}

if (require.main === module) {
  (async function () {
    await main();
  })();
}
