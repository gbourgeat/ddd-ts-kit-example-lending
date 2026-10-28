import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Flags the due diligence of a customer as overdue when its refresh is past its date: nothing changes while it is current. */
export class FlagOverdueDueDiligenceCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
