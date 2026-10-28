import { describe, expect, it } from '@jest/globals';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';

describe('SimulatedAccountInformationProvider', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedAccountInformationProvider()).toBeInstanceOf(SimulatedAccountInformationProvider);
  });

  it('answers the simulated income and expenses for any consent, since no accounts provider is connected yet', async () => {
    const provider = new SimulatedAccountInformationProvider();

    await expect(provider.readIncomeAndExpenses('CONSENT-1')).resolves.toEqual({
      monthlyIncomeInCents: 250_000,
      monthlyExpensesInCents: 90_000,
    });
  });
});
