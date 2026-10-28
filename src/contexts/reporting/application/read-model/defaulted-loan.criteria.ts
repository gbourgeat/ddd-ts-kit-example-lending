import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { DefaultedLoanRow } from '@/contexts/reporting/application/read-model/defaulted-loan.row';

/** What a read of the defaulted-loans read model may filter by. */
export const defaultedLoanCriteria = defineCriteria<DefaultedLoanRow>({
  fields: {
    key: { type: 'string', filter: ['eq'] },
    tenantId: { type: 'string', filter: ['eq'] },
    loanId: { type: 'string', filter: ['eq', 'in'] },
  },
  tieBreaker: 'key',
});
