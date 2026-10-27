import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { PersonIdentity } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

/** Declares the directors and the beneficial owners of a registered business, each one identified as a person. */
export class DeclareDirectorsAndOwnersCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly directors: readonly PersonIdentity[],
    readonly beneficialOwners: readonly PersonIdentity[],
  ) {
    super(actor);
  }
}
