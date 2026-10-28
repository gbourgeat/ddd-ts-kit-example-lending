import { Repository } from '@ddd-ts-kit/kernel';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

export abstract class LoanRepository extends Repository<Loan> {
  /** The loans closed on or before the instant, whose retention runs out then. */
  abstract findClosedOnOrBefore(instant: Date): Promise<readonly Loan[]>;
}
