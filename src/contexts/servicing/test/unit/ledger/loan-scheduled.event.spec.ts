import { describe, expect, it } from '@jest/globals';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanScheduled', () => {
  it('is named after the context, the aggregate and the fact, and carries the schedule of the loan', () => {
    const schedule = LoanSchedule.of(Money.ofCents(10_000), 0, 4);
    const event = new LoanScheduled('loan-1', new Date('2026-01-01T00:00:00.000Z'), schedule);

    expect(event.name).toBe('servicing.loan.scheduled');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.schedule).toBe(schedule);
  });
});
