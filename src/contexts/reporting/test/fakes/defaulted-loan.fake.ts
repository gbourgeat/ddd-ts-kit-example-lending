import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { DefaultedLoan } from '@/contexts/reporting/application/ports/defaulted-loan.port';
import { defaultedLoanCriteria } from '@/contexts/reporting/application/read-model/defaulted-loan.criteria';
import type { DefaultedLoanRow } from '@/contexts/reporting/application/read-model/defaulted-loan.row';

/** The loans in default in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeDefaultedLoan extends InMemoryReadModelStore<DefaultedLoanRow> implements DefaultedLoan {
  constructor() {
    super(defaultedLoanCriteria);
  }
}
