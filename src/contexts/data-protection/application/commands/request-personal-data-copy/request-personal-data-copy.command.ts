import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { IssuedPersonalDataCopy } from '@/contexts/data-protection/application/commands/request-personal-data-copy/issued-personal-data-copy.result';

/**
 * Asks for a copy of all the bank keeps about a data subject, the customer. Only the customer's self
 * or an operator of data-protection may ask: the requirement of the use case names the customer.
 * Answers the copy kept seven days, and the link that downloads it until the link expires.
 */
export class RequestPersonalDataCopyCommand extends AuthorizedCommand<IssuedPersonalDataCopy> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
