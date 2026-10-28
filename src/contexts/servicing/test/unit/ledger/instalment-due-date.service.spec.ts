import { describe, expect, it } from '@jest/globals';
import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';

describe('The due date of an instalment', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new InstalmentDueDateService())).toEqual([]);
  });

  it('falls due one calendar month after the payout, on the payout day', () => {
    const due = new InstalmentDueDateService().dueOn(new Date('2026-01-10T00:00:00.000Z'), 1);

    expect(due).toEqual(new Date('2026-02-10T00:00:00.000Z'));
  });

  it('falls due n months after the payout for the instalment n, across a year end', () => {
    const due = new InstalmentDueDateService().dueOn(new Date('2026-11-10T00:00:00.000Z'), 3);

    expect(due).toEqual(new Date('2027-02-10T00:00:00.000Z'));
  });

  it('falls due on the last day of a shorter month when the payout day does not exist in it', () => {
    const due = new InstalmentDueDateService().dueOn(new Date('2026-01-31T00:00:00.000Z'), 1);

    expect(due).toEqual(new Date('2026-02-28T00:00:00.000Z'));
  });

  it('falls due on the 29th of February of a leap year', () => {
    const due = new InstalmentDueDateService().dueOn(new Date('2028-01-31T00:00:00.000Z'), 1);

    expect(due).toEqual(new Date('2028-02-29T00:00:00.000Z'));
  });

  it('keeps the time of day of the payout', () => {
    const due = new InstalmentDueDateService().dueOn(new Date('2026-01-10T08:30:15.250Z'), 2);

    expect(due).toEqual(new Date('2026-03-10T08:30:15.250Z'));
  });
});
