import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { DecisionCountRow } from '@/contexts/reporting/application/read-model/decision-count.row';

/** The decisions-per-branch read model: one line per tenant, branch and month, kept by the projection. */
export abstract class DecisionCounts extends ReadModelStore<DecisionCountRow> {}
