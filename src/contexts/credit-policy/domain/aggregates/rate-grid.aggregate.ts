import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';

/** One band of a grid: the rate, in basis points of a year, of a credit lasting up to this many months. */
export interface RateBandState {
  readonly upToMonths: number;
  readonly rateBasisPoints: number;
}

export interface RateGridState {
  readonly registeredAt: Date;
  readonly productId: string;
  readonly effectiveFrom: Date;
  readonly rates: readonly RateBandState[];
}

/** What a grid is published with: its product, its day of effect and its bands. */
export interface RateGridPublication {
  readonly productId: string;
  readonly effectiveFrom: Date;
  readonly rates: readonly RateBandState[];
}

export class RateGrid extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: RateGridState,
  ) {
    super(id);
  }

  static create(id: string, publication: RateGridPublication, now: Date): RateGrid {
    const { productId, effectiveFrom } = publication;
    const rates = publication.rates.map((band) => ({ ...band }));
    const created = new RateGrid(id, { registeredAt: now, productId, effectiveFrom, rates });

    created.record(new RateGridPublished(id, now, { productId, effectiveFrom, rates }));

    return created;
  }

  static rehydrate(id: string, state: RateGridState): RateGrid {
    return new RateGrid(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get productId(): string {
    return this.state.productId;
  }

  get effectiveFrom(): Date {
    return this.state.effectiveFrom;
  }

  get rates(): readonly RateBandState[] {
    return this.state.rates;
  }

  toState(): RateGridState {
    return { ...this.state };
  }
}
