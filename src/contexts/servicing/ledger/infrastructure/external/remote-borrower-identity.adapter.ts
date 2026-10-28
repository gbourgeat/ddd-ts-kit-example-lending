import type { CustomerIdentityContract } from '@/contexts/customer-due-diligence/published-language';
import type { BorrowerIdentity } from '@/contexts/servicing/ledger/application/ports/borrower-identity.port';

/** Reads the name of a borrower from customer-due-diligence, in process: the platform hands its published contract. */
export class RemoteBorrowerIdentity implements BorrowerIdentity {
  constructor(private readonly customers: CustomerIdentityContract) {}

  async nameOf(customerId: string): Promise<string | undefined> {
    return (await this.customers.identityOf(customerId))?.name;
  }
}
