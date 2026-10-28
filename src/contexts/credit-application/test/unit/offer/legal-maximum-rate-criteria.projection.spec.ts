import { describe, expect, it } from '@jest/globals';
import { legalMaximumRateCriteria } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-criteria.projection';

describe('Legal maximum rate read model criteria', () => {
  it('lets a read filter the legal maximum rates by their identifier', () => {
    expect(legalMaximumRateCriteria.fields.legalMaximumRateId?.filter).toContain('eq');
  });
});
