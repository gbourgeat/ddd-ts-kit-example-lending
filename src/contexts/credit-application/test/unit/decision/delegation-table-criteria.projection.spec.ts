import { describe, expect, it } from '@jest/globals';
import { delegationTableCriteria } from '@/contexts/credit-application/decision/application/projections/delegation-table-criteria.projection';

describe('Delegation table read model criteria', () => {
  it('lets a read filter the delegation tables by their identifier', () => {
    expect(delegationTableCriteria.fields.delegationTableId?.filter).toContain('eq');
  });
});
