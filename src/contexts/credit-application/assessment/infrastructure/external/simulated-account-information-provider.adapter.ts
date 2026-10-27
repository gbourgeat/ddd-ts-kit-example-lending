import type {
  AccountInformationProvider,
  IncomeAndExpenses,
} from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';

export class SimulatedAccountInformationProvider implements AccountInformationProvider {
  private readonly consents = new Map<string, IncomeAndExpenses>();

  record(consentId: string, figures: IncomeAndExpenses): void {
    this.consents.set(consentId, figures);
  }

  async readIncomeAndExpenses(consentId: string): Promise<IncomeAndExpenses> {
    const figures = this.consents.get(consentId);

    if (!figures) {
      throw new Error('no consent is recorded for this identifier');
    }

    return figures;
  }
}
