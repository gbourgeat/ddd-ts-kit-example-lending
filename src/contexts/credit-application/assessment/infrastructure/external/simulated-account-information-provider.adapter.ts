import type {
  AccountInformationProvider,
  IncomeAndExpenses,
} from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';

/** Simulated figures, the same for every applicant: no real accounts provider is connected yet. */
const SIMULATED_FIGURES: IncomeAndExpenses = { monthlyIncomeInCents: 250_000, monthlyExpensesInCents: 90_000 };

export class SimulatedAccountInformationProvider implements AccountInformationProvider {
  async readIncomeAndExpenses(_consentId: string): Promise<IncomeAndExpenses> {
    return SIMULATED_FIGURES;
  }
}
