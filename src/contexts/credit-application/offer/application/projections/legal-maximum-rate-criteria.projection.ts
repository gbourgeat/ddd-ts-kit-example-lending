import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRateRow } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';

/** What a read of the legal maximum rates read model may filter by. */
export const legalMaximumRateCriteria = defineCriteria<LegalMaximumRateRow>({
  fields: {
    legalMaximumRateId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'legalMaximumRateId',
});
