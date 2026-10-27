import type { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import { InvalidLegalMaximumRate } from '@/contexts/credit-policy/domain/errors/invalid-legal-maximum-rate.error';
import type { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';

export class LegalMaximumRateScheduleService {
  /** A rate takes effect no earlier than the latest rate of its category: an earlier one is refused. */
  ensureNotBeforeLatest(terms: LegalMaximumRateTerms, latest: LegalMaximumRate | undefined): void {
    if (latest !== undefined && terms.effectiveFrom < latest.effectiveFrom) {
      throw InvalidLegalMaximumRate.forBeforeLatest(terms.effectiveFrom, latest.effectiveFrom);
    }
  }
}
