import { describe, expect, it } from '@jest/globals';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

describe('LoanArrearsBucketEntered', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanArrearsBucketEntered('loan-1', new Date('2026-01-01T00:00:00.000Z'), ArrearsBucket.None);

    expect(event.name).toBe('servicing.loan.arrears-bucket-entered');
    expect(event.aggregateId).toBe('loan-1');
  });

  it('carries the bucket the loan is placed in', () => {
    const event = new LoanArrearsBucketEntered(
      'loan-1',
      new Date('2026-01-01T00:00:00.000Z'),
      ArrearsBucket.OneToThirtyDays,
    );

    expect(event.bucket).toBe(ArrearsBucket.OneToThirtyDays);
  });
});
