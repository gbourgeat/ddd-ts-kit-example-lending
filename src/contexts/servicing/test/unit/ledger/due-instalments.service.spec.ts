import { describe, expect, it } from '@jest/globals';
import { DueInstalmentsService } from '@/contexts/servicing/ledger/domain/services/due-instalments.service';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const paidOutAt = new Date('2026-01-10T00:00:00.000Z');
const schedule = LoanSchedule.of(Money.ofCents(120_000), 0, 12);

describe('The instalments fallen due', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new DueInstalmentsService())).toEqual([]);
  });

  it('lists the instalments whose month has come, numbered from one', () => {
    const due = new DueInstalmentsService().of(
      schedule,
      { paidOutAt, notedBefore: 0, alreadyDue: [] },
      new Date('2026-03-10T00:00:00.000Z'),
    );

    expect(due.map((instalment) => instalment.number)).toEqual([1, 2]);
  });

  it('leaves out the instalments already noted due', () => {
    const due = new DueInstalmentsService().of(
      schedule,
      { paidOutAt, notedBefore: 0, alreadyDue: [1] },
      new Date('2026-03-10T00:00:00.000Z'),
    );

    expect(due.map((instalment) => instalment.number)).toEqual([2]);
  });

  it('numbers the instalments of a rescheduled loan after those noted before the new schedule', () => {
    const due = new DueInstalmentsService().of(
      schedule,
      { paidOutAt, notedBefore: 2, alreadyDue: [1, 2] },
      new Date('2026-04-10T00:00:00.000Z'),
    );

    expect(due.map((instalment) => instalment.number)).toEqual([3]);
  });
});
