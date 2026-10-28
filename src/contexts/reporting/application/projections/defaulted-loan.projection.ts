import { stampOf, type ReadModelWrite } from '@ddd-ts-kit/kernel';
import type { LoanDefaultedV1 } from '@/contexts/servicing/published-language';
import type { DefaultedLoan } from '@/contexts/reporting/application/ports/defaulted-loan.port';

/** Keeps each loan servicing declares in default, with the instant of the declaration, from what servicing announces. */
export class DefaultedLoanProjection {
  constructor(private readonly loans: DefaultedLoan) {}

  async defaulted(event: LoanDefaultedV1): Promise<ReadModelWrite> {
    const { loanId } = event.payload;
    const tenantId = event.tenantId ?? '';
    const key = `${tenantId}:${loanId}`;

    return this.loans.upsertIfNewer(key, stampOf(event), () => ({
      key,
      tenantId,
      loanId,
      defaultedAt: new Date(event.occurredAt),
    }));
  }
}
