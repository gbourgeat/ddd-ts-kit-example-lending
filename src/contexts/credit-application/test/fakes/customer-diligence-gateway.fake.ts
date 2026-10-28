import type { CreditEligibility } from '@/contexts/customer-due-diligence/published-language';
import type { CustomerDiligenceGateway } from '@/contexts/credit-application/offer/application/ports/customer-diligence-gateway.port';

export class FakeCustomerDiligenceGateway implements CustomerDiligenceGateway {
  private readonly answers = new Map<string, CreditEligibility>();

  /** What customer-due-diligence answers for the customer, given by the test. */
  answering(customerId: string, eligibility: CreditEligibility): this {
    this.answers.set(customerId, eligibility);

    return this;
  }

  eligibilityOf(customerId: string): Promise<CreditEligibility> {
    return Promise.resolve(this.answers.get(customerId) ?? { eligible: false, reason: 'unknown-customer' });
  }
}
