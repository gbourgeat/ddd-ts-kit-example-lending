import { describe, expect, it } from '@jest/globals';
import { applicationCountCriteria } from '@/contexts/reporting/application/projections/application-count-criteria.projection';

describe('Applications-per-branch reads, what they may filter and sort by', () => {
  it('filters by branch, in a list of branches, and by month, and sorts by the line key', () => {
    expect(applicationCountCriteria).toMatchObject({
      fields: {
        branchId: { filter: ['eq', 'in'] },
        month: { filter: ['eq'] },
      },
      tieBreaker: 'key',
    });
  });
});
