import type { OfferPricing } from '@/contexts/credit-application/offer/application/ports/offer-pricing.port';
import {
  RateGridService,
  type RateBandOf,
} from '@/contexts/credit-application/offer/domain/services/rate-grid.service';

interface FakeGrid {
  readonly productId: string;
  readonly effectiveFrom: Date;
  readonly rates: readonly RateBandOf[];
}

interface FakeMaximum {
  readonly category: string;
  readonly effectiveFrom: Date;
  readonly rateBasisPoints: number;
}

/** The pricing in memory: the grids and maximums a spec lists, read with the same rule as the adapter. */
export class FakeOfferPricing implements OfferPricing {
  private readonly schedule = new RateGridService();
  private readonly grids: FakeGrid[] = [];
  private readonly maximums: FakeMaximum[] = [];

  publishGrid(grid: FakeGrid): void {
    this.grids.push(grid);
  }

  publishMaximum(maximum: FakeMaximum): void {
    this.maximums.push(maximum);
  }

  async rateBasisPointsFor(productId: string, durationMonths: number, day: Date): Promise<number | undefined> {
    const grid = this.schedule.inForceOn(
      this.grids.filter((candidate) => candidate.productId === productId),
      day,
    );

    return grid === undefined ? undefined : this.schedule.bandRateOf(grid.rates, durationMonths);
  }

  async legalMaximumBasisPointsFor(category: string, day: Date): Promise<number | undefined> {
    return this.schedule.inForceOn(
      this.maximums.filter((candidate) => candidate.category === category),
      day,
    )?.rateBasisPoints;
  }
}
