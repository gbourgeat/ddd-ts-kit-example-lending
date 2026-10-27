import { describe, expect, it } from '@jest/globals';
import { SimulatedElectronicSignature } from '@/contexts/credit-application/offer/infrastructure/external/simulated-electronic-signature.adapter';

describe('SimulatedElectronicSignature', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedElectronicSignature()).toBeInstanceOf(SimulatedElectronicSignature);
  });

  it('answers a signature reference for an offer sent to be signed', async () => {
    const signature = new SimulatedElectronicSignature();

    await expect(signature.requestSignature('OFFER-1', 'Jean Dupont')).resolves.toBe('SIG-OFFER-1');
  });

  it('answers a different signature reference for each offer', async () => {
    const signature = new SimulatedElectronicSignature();
    const first = await signature.requestSignature('OFFER-1', 'Jean Dupont');
    const second = await signature.requestSignature('OFFER-2', 'Marie Curie');

    expect(second).not.toBe(first);
  });
});
