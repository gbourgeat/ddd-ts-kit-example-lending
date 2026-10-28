import type { ElectronicSignature } from '@/contexts/credit-application/offer/application/ports/electronic-signature.port';

export class FakeElectronicSignature implements ElectronicSignature {
  readonly requested: { offerId: string; signerId: string }[] = [];

  async requestSignature(offerId: string, signerId: string): Promise<string> {
    this.requested.push({ offerId, signerId });

    return `signature-${this.requested.length}`;
  }
}
