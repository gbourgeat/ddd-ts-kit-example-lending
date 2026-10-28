import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';

/** What a read of the loan-principal read model may filter and sort by. */
export const loanPrincipalCriteria = defineCriteria<LoanPrincipalRow>({
  fields: {
    key: { type: 'string', filter: ['eq'] },
    tenantId: { type: 'string', filter: ['eq'] },
    loanId: { type: 'string', filter: ['eq', 'in'] },
    branchId: { type: 'string', filter: ['eq', 'in'] },
  },
  tieBreaker: 'key',
});
