import type {
  CreditEligibility,
  CustomerDiligenceContract,
} from '@/contexts/customer-due-diligence/published-language';
import type { CustomerDiligenceGateway } from '@/contexts/credit-application/offer/application/ports/customer-diligence-gateway.port';

// TODO(platform): when customer-due-diligence runs as its own service, write the remote adapter of CustomerDiligenceGateway next to this one (an HTTP or RPC client with a timeout, retries and a fallback) and bind it instead; nothing else changes.
export class InProcessCustomerDiligenceGateway implements CustomerDiligenceGateway {
  constructor(readonly upstream: CustomerDiligenceContract) {}

  eligibilityOf(customerId: string, asOf: Date): Promise<CreditEligibility> {
    return this.upstream.eligibilityOf(customerId, asOf.toISOString());
  }
}
