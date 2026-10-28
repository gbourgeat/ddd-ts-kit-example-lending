import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { ApplicationCountRow } from '@/contexts/reporting/application/read-model/application-count.row';

/** What a read of the applications-per-branch read model may filter and sort by. */
export const applicationCountCriteria = defineCriteria<ApplicationCountRow>({
  fields: {
    key: { type: 'string', filter: ['eq'] },
    tenantId: { type: 'string', filter: ['eq'] },
    branchId: { type: 'string', filter: ['eq', 'in'] },
    month: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'key',
});
