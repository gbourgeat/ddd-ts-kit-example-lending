import type { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

export class CustomerFileOnIdentifiedEventHandler {
  async handle(event: CustomerIdentified): Promise<void> {
    // TODO(domain): state the policy "when customer identified, then ..." and carry it out by executing a command handler of this context (inject it through the constructor). It runs at the end of the unit of work, before the commit: depend only on what the transaction covers; an effect outside the database belongs in the after-commit phase or, when it must not be lost, behind an integration event, where a reaction in another context goes too.
  }
}
