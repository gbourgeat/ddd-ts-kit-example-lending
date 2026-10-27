import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import type { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { EndRelationshipCommand } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.command';

/** When compliance confirms a sanctions match, the relationship with that customer ends, as the system does it. */
export class EndRelationshipOnSanctionsMatchEventHandler {
  constructor(private readonly commands: CommandBus) {}

  async handle(event: CustomerSanctionsMatchConfirmed): Promise<void> {
    await this.commands.execute(
      new EndRelationshipCommand(systemActor(EndRelationshipOnSanctionsMatchEventHandler.name), event.aggregateId),
    );
  }
}
