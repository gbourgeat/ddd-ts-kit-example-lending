import { describe, expect, it } from '@jest/globals';
import { OutstandingCapitalService } from '@/contexts/servicing/ledger/domain/services/outstanding-capital.service';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const schedule = LoanSchedule.of(Money.ofCents(100_000), 500, 12);

describe('Outstanding capital', () => {
  it('is the principal when no instalment is noted and nothing is repaid', () => {
    const capital = new OutstandingCapitalService().of(schedule, 0, []);

    expect(capital.cents).toBe(100_000);
  });

  it('is below the principal once an instalment is noted: its capital is repaid', () => {
    const capital = new OutstandingCapitalService().of(schedule, 2, []);

    expect(capital.cents).toBeLessThan(100_000);
  });

  it('is less each amount repaid early or written off', () => {
    const capital = new OutstandingCapitalService().of(schedule, 0, [Money.ofCents(30_000), Money.ofCents(10_000)]);

    expect(capital.cents).toBe(60_000);
  });
});
