import { describe, expect, it } from '@jest/globals';
import { deciderLevelCriteria } from '@/contexts/credit-application/decision/application/projections/decider-level-criteria.projection';

describe('Decider level read model criteria', () => {
  it('lets a read filter the decider levels by staff member', () => {
    expect(deciderLevelCriteria.fields.staffMemberId?.filter).toContain('eq');
  });
});
