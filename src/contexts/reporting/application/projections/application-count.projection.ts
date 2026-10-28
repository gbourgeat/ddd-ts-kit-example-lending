import { stampOf, type ReadModelWrite } from '@ddd-ts-kit/kernel';
import type { CreditApplicationSubmittedV2 } from '@/contexts/credit-application/published-language';
import type { ApplicationCounts } from '@/contexts/reporting/application/ports/application-counts.port';

/** The length of `YYYY-MM`, the month of a submission in UTC. */
const YEAR_AND_MONTH_LENGTH = 7;

/** Keeps the applications-per-branch read model from what credit-application announces. */
export class ApplicationCountProjection {
  constructor(private readonly counts: ApplicationCounts) {}

  async submitted(event: CreditApplicationSubmittedV2): Promise<ReadModelWrite> {
    const tenantId = event.tenantId ?? '';
    const { branchId, requestedAmountCents } = event.payload;
    const month = this.monthOf(stampOf(event).occurredAt);
    const key = `${tenantId}:${branchId}:${month}`;

    return this.counts.upsertIfNewer(key, stampOf(event), (current) => ({
      key,
      tenantId,
      branchId,
      month,
      applicationCount: (current?.applicationCount ?? 0) + 1,
      amountCents: (current?.amountCents ?? 0) + requestedAmountCents,
    }));
  }

  /** The month of an instant, in UTC, as `YYYY-MM`. */
  private monthOf(instant: Date): string {
    return instant.toISOString().slice(0, YEAR_AND_MONTH_LENGTH);
  }
}
