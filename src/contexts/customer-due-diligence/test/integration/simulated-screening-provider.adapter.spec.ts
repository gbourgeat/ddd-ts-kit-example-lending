import { describe, expect, it } from '@jest/globals';
import { SimulatedScreeningProvider } from '@/contexts/customer-due-diligence/infrastructure/external/simulated-screening-provider.adapter';

describe('SimulatedScreeningProvider', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedScreeningProvider()).toBeInstanceOf(SimulatedScreeningProvider);
  });

  it('answers a possible match when a listed person has the same name and birth date', async () => {
    const screening = new SimulatedScreeningProvider();

    screening.record('Jean Dupont', new Date('1970-03-02'));

    await expect(screening.screen('jean dupont', new Date('1970-03-02'))).resolves.toEqual({ possibleMatch: true });
  });

  it('answers no possible match for a person the lists do not carry', async () => {
    const screening = new SimulatedScreeningProvider();

    screening.record('Jean Dupont', new Date('1970-03-02'));

    await expect(screening.screen('Marie Curie', new Date('1867-11-07'))).resolves.toEqual({ possibleMatch: false });
  });
});
