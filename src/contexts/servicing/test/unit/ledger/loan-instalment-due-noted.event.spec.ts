import { describe, expect, it } from '@jest/globals';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanInstalmentDueNoted', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanInstalmentDueNoted(
      'loan-1',
      new Date('2026-01-01T00:00:00.000Z'),
      1,
      new Date('2026-02-10T00:00:00.000Z'),
      Money.ofCents(8000),
    );

    expect(event.name).toBe('servicing.loan.instalment-due-noted');
    expect(event.aggregateId).toBe('loan-1');
  });
});
