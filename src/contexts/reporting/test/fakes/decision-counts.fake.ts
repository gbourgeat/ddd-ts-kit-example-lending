import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { DecisionCounts } from '@/contexts/reporting/application/ports/decision-counts.port';
import { decisionCountCriteria } from '@/contexts/reporting/application/read-model/decision-count.criteria';
import type { DecisionCountRow } from '@/contexts/reporting/application/read-model/decision-count.row';

/** The decisions-per-branch read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeDecisionCounts extends InMemoryReadModelStore<DecisionCountRow> implements DecisionCounts {
  constructor() {
    super(decisionCountCriteria);
  }
}
