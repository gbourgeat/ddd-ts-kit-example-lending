import type { CustomerDiligenceContract } from '@/contexts/customer-due-diligence/published-language/customer-diligence.contract';
import type { CreditEligibility } from '@/contexts/customer-due-diligence/published-language/credit-eligibility';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';

/** Answers whether a customer may be lent to on a day, read from its aggregate. */
export class CreditEligibilityAnswer implements CustomerDiligenceContract {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async eligibilityOf(customerId: string, asOf: string): Promise<CreditEligibility> {
    const customer = await this.customerRepository.findById(customerId);

    if (customer === undefined) {
      return { eligible: false, reason: 'unknown-customer' };
    }

    const state = customer.toState();

    if (state.relationshipEndedAt !== undefined) {
      return { eligible: false, reason: 'relationship-ended' };
    }

    if (state.sanctionsMatchConfirmedAt !== undefined) {
      return { eligible: false, reason: 'sanctions-match' };
    }

    if (state.riskRating === RiskRating.High && state.highRiskApprovedAt === undefined) {
      return { eligible: false, reason: 'high-risk-not-approved' };
    }

    return customer.isDueBefore(new Date(asOf))
      ? { eligible: false, reason: 'due-diligence-overdue' }
      : { eligible: true };
  }
}
