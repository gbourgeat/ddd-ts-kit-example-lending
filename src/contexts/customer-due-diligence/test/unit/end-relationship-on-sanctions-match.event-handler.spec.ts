import { describe, expect, it } from '@jest/globals';
import {
  InMemoryCommandBus,
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { EndRelationshipOnSanctionsMatchEventHandler } from '@/contexts/customer-due-diligence/application/event-handlers/end-relationship-on-sanctions-match.event-handler';
import { EndRelationshipCommand } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.command';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';

const confirmedOn = new Date('2026-01-01T00:00:00.000Z');

describe('When customer sanctions match confirmed', () => {
  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const { handler } = arrange();
    const event = new CustomerSanctionsMatchConfirmed('customer-1', confirmedOn);
    const domainEvents = new InMemoryDomainEventDispatcher();
    const reactedAt: string[] = [];

    const asSubscribed = async (): Promise<void> => {
      await handler.handle(event);
      reactedAt.push(unitOfWorkStage());
    };

    domainEvents.on(CustomerSanctionsMatchConfirmed.eventName, asSubscribed, { phase: 'before-commit' });
    await new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents));

    expect(reactedAt).toEqual(['before-commit']);
    expect(domainEvents.afterCommitFailures).toEqual([]);
  });

  it('ends the relationship with the customer of the confirmed match, as the system', async () => {
    const { handler, received } = arrange();

    await handler.handle(new CustomerSanctionsMatchConfirmed('customer-7', confirmedOn));

    expect(received.map((command) => command.customerId)).toEqual(['customer-7']);
    expect(received.map((command) => command.actor.type)).toEqual(['system']);
  });
});

function arrange() {
  const received: EndRelationshipCommand[] = [];

  const commands = new InMemoryCommandBus().register(EndRelationshipCommand, {
    execute: async (command: EndRelationshipCommand): Promise<string> => {
      received.push(command);

      return command.customerId;
    },
  });

  return { handler: new EndRelationshipOnSanctionsMatchEventHandler(commands), received };
}
