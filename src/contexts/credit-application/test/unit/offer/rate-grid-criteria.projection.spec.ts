import { describe, expect, it } from '@jest/globals';
import { rateGridCriteria } from '@/contexts/credit-application/offer/application/projections/rate-grid-criteria.projection';

describe('Rate grid read model criteria', () => {
  it('lets a read filter the rate grids by their identifier', () => {
    expect(rateGridCriteria.fields.rateGridId?.filter).toContain('eq');
  });
});
