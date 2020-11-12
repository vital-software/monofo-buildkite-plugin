import Config from '../config';

const NOTHING_TO_DO_STEP_LABEL = `:white_check_mark: :shrug: Nothing to do`;

/**
 * When no subcomponents match, pop a message onto the build
 *
 * @todo add a block step, ask the user if they want to do a full build?
 */
export function nothingToDoSteps(configs: Config[]): Step[] {
  if (configs.find((v) => v.included)) {
    return [];
  }

  return [
    {
      label: NOTHING_TO_DO_STEP_LABEL,
      key: 'nothing-to-do',
      command: `echo 'All build parts were skipped'`,
    } as CommandStep,
  ];
}
