import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';

export interface LegalMaximumRateState {
  readonly registeredAt: Date;
  readonly category: string;
  readonly effectiveFrom: Date;
}

export class LegalMaximumRate extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: LegalMaximumRateState,
  ) {
    super(id);
  }

  static create(id: string, category: string, effectiveFrom: Date, now: Date): LegalMaximumRate {
    const created = new LegalMaximumRate(id, { registeredAt: now, category, effectiveFrom });

    created.record(new LegalMaximumRatePublished(id, now));

    return created;
  }

  static rehydrate(id: string, state: LegalMaximumRateState): LegalMaximumRate {
    return new LegalMaximumRate(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get category(): string {
    return this.state.category;
  }

  get effectiveFrom(): Date {
    return this.state.effectiveFrom;
  }

  toState(): LegalMaximumRateState {
    return { ...this.state };
  }
}
