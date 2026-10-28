import { describe, expect, it } from '@jest/globals';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';

describe('LoanInstalmentMarkedUnpaid', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanInstalmentMarkedUnpaid('loan-1', new Date('2026-01-01T00:00:00.000Z'), 1);

    expect(event.name).toBe('servicing.loan.instalment-marked-unpaid');
    expect(event.aggregateId).toBe('loan-1');
  });

  it('carries the number of the instalment that was rejected', () => {
    const event = new LoanInstalmentMarkedUnpaid('loan-1', new Date('2026-01-01T00:00:00.000Z'), 1);

    expect(event.number).toBe(1);
  });
});
