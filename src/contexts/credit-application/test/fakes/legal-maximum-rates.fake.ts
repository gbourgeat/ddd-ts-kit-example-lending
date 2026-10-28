import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type {
  LegalMaximumRateRow,
  LegalMaximumRates,
} from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';
import { legalMaximumRateCriteria } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-criteria.projection';

/** The legal maximum rates read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeLegalMaximumRates extends InMemoryReadModelStore<LegalMaximumRateRow> implements LegalMaximumRates {
  constructor() {
    super(legalMaximumRateCriteria);
  }
}
