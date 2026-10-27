import { AuthorizedCommand, type Actor, type SignedUrl } from '@ddd-ts-kit/kernel';

/**
 * Asks for a copy of all the bank keeps about a data subject, the customer. Only the customer's self
 * or an operator of data-protection may ask: the requirement of the use case names the customer.
 * Answers the signed link that downloads the copy, until it expires.
 */
export class RequestPersonalDataCopyCommand extends AuthorizedCommand<SignedUrl> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
