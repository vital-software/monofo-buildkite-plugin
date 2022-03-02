import Reason from '../reason';

export class Decision {
  constructor(
    private readonly name: string,
    private readonly included: boolean | undefined,
    private readonly reason: Reason
  ) {}
}
