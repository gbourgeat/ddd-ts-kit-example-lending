import { describe, expect, it } from '@jest/globals';
import {
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { CustomerFileOnIdentifiedEventHandler } from '@/contexts/customer-due-diligence/application/event-handlers/customer-file-on-identified.event-handler';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { FakeCustomerFileProjection } from '@/contexts/customer-due-diligence/test/fakes/customer-file-projection.fake';

const identifiedOn = new Date('2026-01-01T00:00:00.000Z');

describe('When customer identified', () => {
  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const projection = new FakeCustomerFileProjection();
    const handler = new CustomerFileOnIdentifiedEventHandler(projection);
    const event = new CustomerIdentified('customer-1', identifiedOn);
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

  it('records the file of the identified customer with the day it was identified', async () => {
    const projection = new FakeCustomerFileProjection();
    const handler = new CustomerFileOnIdentifiedEventHandler(projection);

    await handler.handle(new CustomerIdentified('customer-1', identifiedOn));

    expect(projection.recorded).toEqual([{ customerId: 'customer-1', identifiedOn }]);
  });

  it('records the file of each identified customer apart', async () => {
    const projection = new FakeCustomerFileProjection();
    const handler = new CustomerFileOnIdentifiedEventHandler(projection);

    await handler.handle(new CustomerIdentified('customer-1', identifiedOn));
    await handler.handle(new CustomerIdentified('customer-2', identifiedOn));

    expect(projection.recorded.map((entry) => entry.customerId)).toEqual(['customer-1', 'customer-2']);
  });
});
