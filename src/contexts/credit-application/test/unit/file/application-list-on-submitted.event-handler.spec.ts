import { describe, expect, it } from '@jest/globals';
import {
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { ApplicationListOnSubmittedEventHandler } from '@/contexts/credit-application/file/application/event-handlers/application-list-on-submitted.event-handler';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { Money } from '@/shared-kernel/money.vo';
import { FakeApplicationListProjection } from '@/contexts/credit-application/test/fakes/application-list-projection.fake';

describe('When credit application submitted', () => {
  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const projection = new FakeApplicationListProjection();
    const handler = new ApplicationListOnSubmittedEventHandler(projection);
    const event = aSubmission('credit-application-1');
    const domainEvents = new InMemoryDomainEventDispatcher();
    const reactedAt: string[] = [];

    const asSubscribed = async (): Promise<void> => {
      await handler.handle(event);
      reactedAt.push(unitOfWorkStage());
    };

    domainEvents.on(CreditApplicationSubmitted.eventName, asSubscribed, { phase: 'before-commit' });
    await new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents));

    expect(reactedAt).toEqual(['before-commit']);
    expect(domainEvents.afterCommitFailures).toEqual([]);
  });

  it('lists the submitted application with the applicant and the requested amount', async () => {
    const projection = new FakeApplicationListProjection();
    const handler = new ApplicationListOnSubmittedEventHandler(projection);

    await handler.handle(aSubmission('credit-application-1'));

    expect(projection.recorded()).toEqual([aSubmission('credit-application-1')]);
  });
});

function aSubmission(id: string): CreditApplicationSubmitted {
  return new CreditApplicationSubmitted(
    id,
    'customer-1',
    Money.ofCents(1234567),
    60,
    new Date('2026-01-01T00:00:00.000Z'),
    'branch-1',
  );
}
