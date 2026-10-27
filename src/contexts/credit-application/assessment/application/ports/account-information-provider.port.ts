export type IncomeAndExpenses = {
  readonly monthlyIncomeInCents: number;
  readonly monthlyExpensesInCents: number;
};

export abstract class AccountInformationProvider {
  /** Reads the monthly income and expenses of an applicant from the accounts they consented to share. */
  abstract readIncomeAndExpenses(consentId: string): Promise<IncomeAndExpenses>;
}
