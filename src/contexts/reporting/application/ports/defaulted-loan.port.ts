import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { DefaultedLoanRow } from '@/contexts/reporting/application/read-model/defaulted-loan.row';

/** The loans in default, one line per tenant and loan, kept by the projection from what servicing announces. */
export abstract class DefaultedLoan extends ReadModelStore<DefaultedLoanRow> {}
