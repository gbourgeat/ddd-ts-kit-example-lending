/** The instalments of a loan that are unpaid: the arrears a loan carries, and the rule of the register declaration. */
export class UnpaidInstalmentsService {
  /** The numbers of the instalments unpaid and not paid since: a late payment settles one of them. */
  unpaidOf(unpaid: readonly number[], paid: readonly number[]): number[] {
    return unpaid.filter((number) => !paid.includes(number));
  }

  /** Whether two instalments whose numbers follow each other are unpaid: the rule of the repayment incident. */
  hasTwoConsecutive(unpaid: readonly number[]): boolean {
    return unpaid.some((number) => unpaid.includes(number + 1));
  }
}
