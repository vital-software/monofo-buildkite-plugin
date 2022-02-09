import { Delays } from 'got/dist/source/core/utils/timed-out';

const TEN_SECONDS = 10 * 1000;
const THIRTY_SECONDS = 30 * 1000;
const THREE_MINUTES = 3 * 60 * 1000;

export function getTimeouts(): Delays {
  const defaults: Delays = {
    lookup: TEN_SECONDS,
    connect: TEN_SECONDS,
    secureConnect: TEN_SECONDS,
    socket: TEN_SECONDS,
    send: THIRTY_SECONDS,
    response: THIRTY_SECONDS,
    request: THREE_MINUTES,
  };

  for (const key of Object.keys(defaults) as (keyof Delays)[]) {
    const override = process.env?.[`MONOFO_TIMEOUT_${key.toUpperCase()}`];

    if (override) {
      defaults[key] = Number(override);
    }
  }

  return defaults;
}
