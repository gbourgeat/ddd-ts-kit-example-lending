import type { Platform } from '@/platform/composition/platform';
import type { RateGrids } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { KeepRateGridHandler } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.handler';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { ReadRateGridHandler } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.handler';

/** The command that keeps the rate grids and the query that reads them, over the read model the module binds. */
export function registerRateGridHandlers(platform: Platform, rateGrids: RateGrids): void {
  platform.commands.register(KeepRateGridCommand, new KeepRateGridHandler(rateGrids), {
    context: 'credit-application',
  });

  platform.queries.register(ReadRateGridQuery, new ReadRateGridHandler(rateGrids), {
    context: 'credit-application',
  });
}
