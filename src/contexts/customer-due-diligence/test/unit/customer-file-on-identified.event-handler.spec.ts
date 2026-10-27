import { describe, expect, it } from '@jest/globals';
import {
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { CustomerFileOnIdentifiedEventHandler } from '@/contexts/customer-due-diligence/application/event-handlers/customer-file-on-identified.event-handler';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

describe('When customer identified', () => {
  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const handler = new CustomerFileOnIdentifiedEventHandler();
    const event = new CustomerIdentified('customer-1', new Date('2026-01-01T00:00:00.000Z'));
    const domainEvents = new InMemoryDomainEventDispatcher();
    const reactedAt: string[] = [];

    const asSubscribed = async (): Promise<void> => {
      await handler.handle(event);
      reactedAt.push(unitOfWorkStage());
    };

    domainEvents.on(CustomerIdentified.eventName, asSubscribed, { phase: 'before-commit' });
    await new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents));

    expect(reactedAt).toEqual(['before-commit']);
    expect(domainEvents.afterCommitFailures).toEqual([]);
  });

  // TODO(domain): replace each entry below by a test named after the policy this reaction implements.
  it.todo('carries out the policy that follows the fact');
  it.todo('does nothing when the policy does not apply');
});
