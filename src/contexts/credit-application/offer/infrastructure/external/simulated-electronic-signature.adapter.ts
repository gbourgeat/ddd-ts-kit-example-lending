import type { ElectronicSignature } from '@/contexts/credit-application/offer/application/ports/electronic-signature.port';

export class SimulatedElectronicSignature implements ElectronicSignature {
  private readonly requests = new Map<string, string>();

  async requestSignature(offerId: string, borrowerName: string): Promise<string> {
    const reference = 'SIG-' + offerId;

    this.requests.set(reference, borrowerName);

    return reference;
  }
}
