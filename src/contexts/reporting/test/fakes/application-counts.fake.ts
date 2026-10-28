import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { ApplicationCounts } from '@/contexts/reporting/application/ports/application-counts.port';
import { applicationCountCriteria } from '@/contexts/reporting/application/projections/application-count-criteria.projection';
import type { ApplicationCountRow } from '@/contexts/reporting/application/ports/application-counts.port';

/** The applications-per-branch read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeApplicationCounts extends InMemoryReadModelStore<ApplicationCountRow> implements ApplicationCounts {
  constructor() {
    super(applicationCountCriteria);
  }
}
