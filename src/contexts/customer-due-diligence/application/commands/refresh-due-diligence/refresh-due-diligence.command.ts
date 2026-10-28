import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Refreshes the due diligence of a customer: re-checks its screening, restates its risk rating only when it has one. */
export class RefreshDueDiligenceCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly name: string,
    readonly birthDate: Date,
  ) {
    super(actor);
  }
}
