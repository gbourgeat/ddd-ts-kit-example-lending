import { stampOf, type ReadModelWrite } from '@ddd-ts-kit/kernel';
import type { CreditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import type { LoanPrincipal } from '@/contexts/reporting/application/ports/loan-principal.port';

/** Keeps the branch and the amount paid out to each loan, to attribute the portfolio at risk and the defaults to a branch. */
export class LoanPrincipalProjection {
  constructor(private readonly principals: LoanPrincipal) {}

  /** A payout recorded on no branch is skipped: there is no branch to attribute the loan to. */
  async payoutAuthorised(event: CreditApplicationPayoutAuthorisedV1): Promise<ReadModelWrite> {
    const { creditApplicationId, branchId, amountCents } = event.payload;

    if (branchId === '') {
      return 'ignored';
    }

    const tenantId = event.tenantId ?? '';
    const loanId = creditApplicationId;
    const key = `${tenantId}:${loanId}`;

    return this.principals.upsertIfNewer(key, stampOf(event), () => ({
      key,
      tenantId,
      loanId,
      branchId,
      principalCents: amountCents,
    }));
  }
}
