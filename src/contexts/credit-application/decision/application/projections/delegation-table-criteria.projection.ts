import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { DelegationTableRow } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';

/** What a read of the delegation tables read model may filter by. */
export const delegationTableCriteria = defineCriteria<DelegationTableRow>({
  fields: {
    delegationTableId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'delegationTableId',
});
