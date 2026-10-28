import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** A staff member authorises the payout of the application: checked against the signing, the withdrawal and the eligibility of the customer. */
export class AuthorizePayoutCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
