import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type {
  DeciderLevelRow,
  DeciderLevels,
} from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import { deciderLevelCriteria } from '@/contexts/credit-application/decision/application/projections/decider-level-criteria.projection';

/** The decider levels read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeDeciderLevels extends InMemoryReadModelStore<DeciderLevelRow> implements DeciderLevels {
  constructor() {
    super(deciderLevelCriteria);
  }
}
