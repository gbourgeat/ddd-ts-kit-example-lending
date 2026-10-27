import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';
import type { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';

export interface LegalMaximumRateState {
  readonly registeredAt: Date;
  readonly category: string;
  readonly rateBasisPoints: number;
  readonly effectiveFrom: Date;
}

export class LegalMaximumRate extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: LegalMaximumRateState,
  ) {
    super(id);
  }

  static create(id: string, terms: LegalMaximumRateTerms, now: Date): LegalMaximumRate {
    const created = new LegalMaximumRate(id, {
      registeredAt: now,
      category: terms.category,
      rateBasisPoints: terms.rateBasisPoints,
      effectiveFrom: terms.effectiveFrom,
    });

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

  get rateBasisPoints(): number {
    return this.state.rateBasisPoints;
  }

  get effectiveFrom(): Date {
    return this.state.effectiveFrom;
  }

  toState(): LegalMaximumRateState {
    return { ...this.state };
  }
}
