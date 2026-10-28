/**
 * When each instalment of a schedule falls due: the instalment `n` is due `n` calendar months after the payout, on the
 * day of the payout, or on the last day of its month when that month is shorter. The dates are read in UTC.
 */
export class InstalmentDueDateService {
  /** The instant the instalment `number` (counted from one) of a loan paid out at `paidOutAt` falls due. */
  dueOn(paidOutAt: Date, number: number): Date {
    const monthIndex = paidOutAt.getUTCMonth() + number;
    const year = paidOutAt.getUTCFullYear();
    const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const day = Math.min(paidOutAt.getUTCDate(), lastDayOfMonth);

    return new Date(
      Date.UTC(
        year,
        monthIndex,
        day,
        paidOutAt.getUTCHours(),
        paidOutAt.getUTCMinutes(),
        paidOutAt.getUTCSeconds(),
        paidOutAt.getUTCMilliseconds(),
      ),
    );
  }
}
