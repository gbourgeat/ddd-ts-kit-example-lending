import { describe, expect, it } from '@jest/globals';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';

describe('SimulatedAccountInformationProvider', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedAccountInformationProvider()).toBeInstanceOf(SimulatedAccountInformationProvider);
  });

  it('answers the income and expenses of a consent it holds', async () => {
    const provider = new SimulatedAccountInformationProvider();

    provider.record('CONSENT-1', { monthlyIncomeInCents: 250000, monthlyExpensesInCents: 120000 });

    await expect(provider.readIncomeAndExpenses('CONSENT-1')).resolves.toEqual({
      monthlyIncomeInCents: 250000,
      monthlyExpensesInCents: 120000,
    });
  });

  it('refuses a consent it does not hold', async () => {
    const provider = new SimulatedAccountInformationProvider();

    await expect(provider.readIncomeAndExpenses('CONSENT-404')).rejects.toThrow(Error);
  });
});
