import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { DecisionCountRow } from '@/contexts/reporting/application/read-model/decision-count.row';

/** What a read of the decisions-per-branch read model may filter and sort by. */
export const decisionCountCriteria = defineCriteria<DecisionCountRow>({
  fields: {
    key: { type: 'string', filter: ['eq'] },
    tenantId: { type: 'string', filter: ['eq'] },
    branchId: { type: 'string', filter: ['eq', 'in'] },
    month: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'key',
});
