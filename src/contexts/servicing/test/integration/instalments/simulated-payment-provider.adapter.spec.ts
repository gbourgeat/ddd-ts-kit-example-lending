import { describe, expect, it } from '@jest/globals';
import { SimulatedPaymentProvider } from '@/contexts/servicing/instalments/infrastructure/external/simulated-payment-provider.adapter';

describe('SimulatedPaymentProvider', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedPaymentProvider()).toBeInstanceOf(SimulatedPaymentProvider);
  });

  it('accepts a direct debit of a positive amount on a loan mandate', async () => {
    const provider = new SimulatedPaymentProvider();

    await expect(provider.collectDirectDebit('loan-1', 45000)).resolves.toEqual({ accepted: true });
  });

  it('rejects a direct debit on a mandate the payer bank refuses', async () => {
    const provider = new SimulatedPaymentProvider();

    await expect(provider.collectDirectDebit('refused-loan-1', 45000)).resolves.toEqual({ accepted: false });
  });

  it('rejects a direct debit of no amount', async () => {
    const provider = new SimulatedPaymentProvider();

    await expect(provider.collectDirectDebit('loan-1', 0)).resolves.toEqual({ accepted: false });
  });
});
