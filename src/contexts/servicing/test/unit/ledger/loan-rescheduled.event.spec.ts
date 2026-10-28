import { describe, expect, it } from '@jest/globals';
import { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanRescheduled', () => {
  it('is named after the context, the aggregate and the fact, and carries its decision and schedule', () => {
    const schedule = LoanSchedule.of(Money.ofCents(80_000), 500, 6);

    const event = new LoanRescheduled('loan-1', new Date('2026-01-01T00:00:00.000Z'), 'decision-1', schedule);

    expect(event.name).toBe('servicing.loan.rescheduled');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.decisionId).toBe('decision-1');
    expect(event.schedule).toEqual(schedule);
  });
});
