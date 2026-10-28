import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { RateGrids } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';
import type { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import type { ReadRateGridResult } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.result';
import { UnknownRateGrid } from '@/contexts/credit-application/offer/domain/errors/unknown-rate-grid.error';

export class ReadRateGridHandler implements QueryHandler<ReadRateGridQuery> {
  constructor(private readonly rateGrids: RateGrids) {}

  async execute(query: ReadRateGridQuery): Promise<ReadRateGridResult> {
    const rateGrid = await this.rateGrids.get(query.rateGridId);

    if (rateGrid === undefined) {
      throw UnknownRateGrid.forUnknownRateGrid();
    }

    return {
      rateGridId: rateGrid.rateGridId,
      productId: rateGrid.productId,
      effectiveFrom: rateGrid.effectiveFrom.toISOString(),
      rates: rateGrid.rates,
    };
  }
}
