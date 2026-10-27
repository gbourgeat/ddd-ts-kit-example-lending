import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

export class SetResidualIncomeMinimumCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly perAdultInCents: number,
    readonly perChildInCents: number,
  ) {
    super(actor);
  }
}
