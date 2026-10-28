import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';

export interface RateGridState {
  readonly registeredAt: Date;
  readonly productId: string;
  readonly effectiveFrom: Date;
}

export class RateGrid extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: RateGridState,
  ) {
    super(id);
  }

  static create(id: string, productId: string, effectiveFrom: Date, now: Date): RateGrid {
    const created = new RateGrid(id, { registeredAt: now, productId, effectiveFrom });

    created.record(new RateGridPublished(id, now, { productId, effectiveFrom }));

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

  toState(): RateGridState {
    return { ...this.state };
  }
}
