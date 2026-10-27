import { describe, expect, it } from '@jest/globals';
import { SimulatedPaymentProvider } from '@/contexts/servicing/instalments/infrastructure/external/simulated-payment-provider.adapter';

describe('SimulatedPaymentProvider', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedPaymentProvider()).toBeInstanceOf(SimulatedPaymentProvider);
  });

  it('accepts a direct debit on a mandate it holds', async () => {
    const provider = new SimulatedPaymentProvider();

    provider.record('MANDATE-1');

    await expect(provider.collectDirectDebit('MANDATE-1', 45000)).resolves.toEqual({ accepted: true });
  });

  it('rejects a direct debit on a mandate it does not hold', async () => {
    const provider = new SimulatedPaymentProvider();

    await expect(provider.collectDirectDebit('MANDATE-404', 45000)).resolves.toEqual({ accepted: false });
  });
});
