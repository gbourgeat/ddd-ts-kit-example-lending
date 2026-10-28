import { stampOf, type ReadModelWrite } from '@ddd-ts-kit/kernel';
import type { CreditApplicationDecidedV1 } from '@/contexts/credit-application/published-language';
import type { DecisionCounts } from '@/contexts/reporting/application/ports/decision-counts.port';

/** The length of `YYYY-MM`, the month of a decision in UTC. */
const YEAR_AND_MONTH_LENGTH = 7;

/** Keeps the decisions-per-branch read model from what credit-application announces. */
export class DecisionProjection {
  constructor(private readonly counts: DecisionCounts) {}

  /** A decision with no branch, as a version 1 stored one, is skipped: it has no branch to count on. */
  async decided(event: CreditApplicationDecidedV1): Promise<ReadModelWrite> {
    const { branchId, outcome, exception } = event.payload;

    if (branchId === '') {
      return 'ignored';
    }

    const tenantId = event.tenantId ?? '';
    const month = this.monthOf(stampOf(event).occurredAt);
    const key = `${tenantId}:${branchId}:${month}`;
    const approved = outcome === 'approve' || outcome === 'approve-with-conditions';

    return this.counts.upsertIfNewer(key, stampOf(event), (current) => ({
      key,
      tenantId,
      branchId,
      month,
      decisionCount: (current?.decisionCount ?? 0) + 1,
      approvalCount: (current?.approvalCount ?? 0) + (approved ? 1 : 0),
      exceptionCount: (current?.exceptionCount ?? 0) + (exception ? 1 : 0),
    }));
  }

  /** The month of an instant, in UTC, as `YYYY-MM`. */
  private monthOf(instant: Date): string {
    return instant.toISOString().slice(0, YEAR_AND_MONTH_LENGTH);
  }
}
