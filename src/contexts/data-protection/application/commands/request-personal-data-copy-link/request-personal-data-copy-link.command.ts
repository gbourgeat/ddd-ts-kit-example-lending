import { AuthorizedCommand, type Actor, type SignedUrl } from '@ddd-ts-kit/kernel';

/**
 * Asks a fresh link to the copy of a data subject, while the copy is kept: seven days after it was
 * made, the copy is deleted. Only the customer's self or an operator of data-protection may ask.
 */
export class RequestPersonalDataCopyLinkCommand extends AuthorizedCommand<SignedUrl> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly copyId: string,
  ) {
    super(actor);
  }
}
