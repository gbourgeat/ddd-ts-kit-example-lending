import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { LoanArrearsBucketEnteredPublisher } from '@/contexts/servicing/arrears/application/integration/publishers/loan-arrears-bucket-entered.publisher';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';

describe('Publishing "loan arrears bucket entered" to other contexts', () => {
  it('publishes version 1 of servicing.loan.arrears-bucket-entered', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LoanArrearsBucketEnteredPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new LoanArrearsBucketEntered('loan-1', new Date('2026-01-01T00:00:00.000Z'), ArrearsBucket.OneToThirtyDays),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'servicing.loan.arrears-bucket-entered',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { loanId: 'loan-1', bucket: 'OneToThirtyDays' },
      },
    ]);
  });
});
