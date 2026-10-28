import type { CustomerIdentityContract } from '@/contexts/customer-due-diligence/published-language';
import type { CustomerIdentityGateway } from '@/contexts/credit-application/assessment/application/ports/customer-identity-gateway.port';

// TODO(platform): when customer-due-diligence runs as its own service, write the remote adapter of CustomerIdentityGateway next to this one (an HTTP or RPC client with a timeout, retries and a fallback) and bind it instead; nothing else changes.
export class InProcessCustomerIdentityGateway implements CustomerIdentityGateway {
  constructor(readonly upstream: CustomerIdentityContract) {}

  identityOf(customerId: string): Promise<{ name: string; birthDate: string } | undefined> {
    return this.upstream.identityOf(customerId);
  }
}
