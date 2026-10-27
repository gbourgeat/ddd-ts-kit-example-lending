import { Repository } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';

export abstract class LegalMaximumRateRepository extends Repository<LegalMaximumRate> {
  /** The rate of the category with the latest date of effect, when the category has one. */
  abstract findLatestOf(category: string): Promise<LegalMaximumRate | undefined>;
}
