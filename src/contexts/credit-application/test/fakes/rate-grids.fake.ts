import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { RateGridRow, RateGrids } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';
import { rateGridCriteria } from '@/contexts/credit-application/offer/application/projections/rate-grid-criteria.projection';

/** The rate grids read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeRateGrids extends InMemoryReadModelStore<RateGridRow> implements RateGrids {
  constructor() {
    super(rateGridCriteria);
  }
}
