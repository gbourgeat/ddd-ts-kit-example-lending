import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { RateGrids } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';
import type { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';

/** Writes the rate grid of the command into the read model, unless the read model holds a later event. */
export class KeepRateGridHandler implements CommandHandler<KeepRateGridCommand> {
  constructor(private readonly rateGrids: RateGrids) {}

  async execute(command: KeepRateGridCommand): Promise<void> {
    const { row, stamp } = command;

    await this.rateGrids.upsertIfNewer(row.rateGridId, stamp, () => row);
  }
}
