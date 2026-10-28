import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { LoanPrincipal } from '@/contexts/reporting/application/ports/loan-principal.port';
import { loanPrincipalCriteria } from '@/contexts/reporting/application/read-model/loan-principal.criteria';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';

/** The branch and the amount paid out to each loan in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeLoanPrincipal extends InMemoryReadModelStore<LoanPrincipalRow> implements LoanPrincipal {
  constructor() {
    super(loanPrincipalCriteria);
  }
}
