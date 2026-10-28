import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';
import type { DefaultedLoanRow } from '@/contexts/reporting/application/read-model/defaulted-loan.row';
import type { LoanPrincipalRow } from '@/contexts/reporting/application/read-model/loan-principal.row';

/**
 * The loans in default with their branch and the amount paid out to them. A loan whose payout is not known is listed nowhere:
 * it has no branch to be reported on.
 */
export function summariseDefaultedLoans(
  defaulted: readonly DefaultedLoanRow[],
  principals: readonly LoanPrincipalRow[],
): DefaultedLoansResult {
  const principalOf = new Map(principals.map((loan) => [`${loan.tenantId}:${loan.loanId}`, loan]));

  const loans = defaulted.flatMap((loan) => {
    const principal = principalOf.get(loan.key);

    if (principal === undefined) {
      return [];
    }

    return [
      {
        loanId: loan.loanId,
        branchId: principal.branchId,
        principalCents: principal.principalCents,
        defaultedAt: loan.defaultedAt.toISOString(),
      },
    ];
  });

  return { loans: loans.sort((first, second) => first.loanId.localeCompare(second.loanId)) };
}
