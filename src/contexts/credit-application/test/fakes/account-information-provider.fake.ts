import type {
  AccountInformationProvider,
  IncomeAndExpenses,
} from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';

const NOTHING_READ: IncomeAndExpenses = { monthlyIncomeInCents: 0, monthlyExpensesInCents: 0 };

export class FakeAccountInformationProvider implements AccountInformationProvider {
  private readonly readings = new Map<string, IncomeAndExpenses>();

  markReadingFor(consentId: string, reading: IncomeAndExpenses): void {
    this.readings.set(consentId, reading);
  }

  async readIncomeAndExpenses(consentId: string): Promise<IncomeAndExpenses> {
    return this.readings.get(consentId) ?? NOTHING_READ;
  }
}
