import type { BorrowerIdentity } from '@/contexts/servicing/ledger/application/ports/borrower-identity.port';

/** The names the spec identifies, by customer: a customer the spec did not identify has no name. */
export class FakeBorrowerIdentity implements BorrowerIdentity {
  private readonly names = new Map<string, string>();

  identify(customerId: string, name: string): void {
    this.names.set(customerId, name);
  }

  async nameOf(customerId: string): Promise<string | undefined> {
    return this.names.get(customerId);
  }
}
