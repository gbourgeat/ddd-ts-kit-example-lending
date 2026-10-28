import { describe, expect, it } from '@jest/globals';
import {
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { CollectDueInstalmentEventHandler } from '@/contexts/servicing/instalments/application/event-handlers/collect-due-instalment.event-handler';
import { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { Money } from '@/shared-kernel/money.vo';

const LOAN_ID = 'loan-1';
const DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const FIRST_INSTALMENT_CENTS = 8_000;

describe('When loan instalment due noted', () => {
  it('sends the collection of the instalment as a system actor', async () => {
    const { handler, collected } = arrange();

    await handler.handle(instalmentDueNoted(1));

    expect(collected[0]?.actor.id).toBe('system:CollectDueInstalmentEventHandler');
  });

  it('collects the instalment with the number and the amount it was noted with', async () => {
    const { handler, collected } = arrange();

    await handler.handle(instalmentDueNoted(1));

    expect(collected[0]?.instalment).toEqual({ number: 1, amountCents: FIRST_INSTALMENT_CENTS });
  });

  it('collects each instalment noted due once', async () => {
    const { handler, collected } = arrange();

    await handler.handle(instalmentDueNoted(1));
    await handler.handle(instalmentDueNoted(2));

    expect(collected.map((command) => command.instalment.number)).toEqual([1, 2]);
  });

  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const { handler } = arrange();
    const event = instalmentDueNoted(1);
    const domainEvents = new InMemoryDomainEventDispatcher();
    const reactedAt: string[] = [];

    const asSubscribed = async (): Promise<void> => {
      await handler.handle(event);
      reactedAt.push(unitOfWorkStage());
    };

    domainEvents.on(LoanInstalmentDueNoted.eventName, asSubscribed, { phase: 'before-commit' });
    await new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents));

    expect(reactedAt).toEqual(['before-commit']);
    expect(domainEvents.afterCommitFailures).toEqual([]);
  });
});

function instalmentDueNoted(number: number): LoanInstalmentDueNoted {
  return new LoanInstalmentDueNoted(LOAN_ID, DUE_ON, number, DUE_ON, Money.ofCents(FIRST_INSTALMENT_CENTS));
}

/** The handler over the command bus of the test, with a collection that only records what it receives. */
function arrange() {
  const { commandBus } = createTestBuses({ idPrefix: 'loan' });
  const collected: CollectInstalmentCommand[] = [];

  commandBus.register(CollectInstalmentCommand, {
    execute: async (command: CollectInstalmentCommand): Promise<void> => {
      collected.push(command);
    },
  });

  return { handler: new CollectDueInstalmentEventHandler(commandBus), collected };
}
