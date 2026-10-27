import { Repository } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';

export abstract class LegalMaximumRateRepository extends Repository<LegalMaximumRate> {}
