import type { ElectronicSignature } from '@/contexts/credit-application/offer/application/ports/electronic-signature.port';

export class FakeElectronicSignature implements ElectronicSignature {
  readonly requested: { offerId: string; borrowerName: string }[] = [];

  async requestSignature(offerId: string, borrowerName: string): Promise<string> {
    this.requested.push({ offerId, borrowerName });

    return `signature-${this.requested.length}`;
  }
}
