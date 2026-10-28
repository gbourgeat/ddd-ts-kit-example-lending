import { AuthorizedQuery } from '@ddd-ts-kit/kernel';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';

/** The loans in default of the bank: the list is the context itself, on no element, so the permission alone gates it. */
export class DefaultedLoansQuery extends AuthorizedQuery<DefaultedLoansResult> {}
