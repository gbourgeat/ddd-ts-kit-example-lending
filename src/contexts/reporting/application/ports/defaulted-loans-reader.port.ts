import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';

/** The loans in default of the tenant, read from the defaults and the payouts the projections kept. */
export abstract class DefaultedLoansReader {
  abstract read(): Promise<DefaultedLoansResult>;
}
