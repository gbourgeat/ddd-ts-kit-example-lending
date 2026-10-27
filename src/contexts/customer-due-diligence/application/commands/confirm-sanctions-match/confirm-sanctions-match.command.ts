import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Compliance confirms the possible match waiting for review on a customer: it becomes a sanctions match. */
export class ConfirmSanctionsMatchCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
