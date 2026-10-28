import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';

/** The branch and the amount paid out to each loan, one line per tenant and loan, kept by the projection from the payouts. */
export abstract class LoanPrincipal extends ReadModelStore<LoanPrincipalRow> {}
