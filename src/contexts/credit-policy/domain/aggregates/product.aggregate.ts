import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';
import type { ProductTerms } from '@/contexts/credit-policy/domain/value-objects/product-terms.vo';

export interface ProductState {
  readonly registeredAt: Date;
  readonly amountMinimumCents: number;
  readonly amountMaximumCents: number;
  readonly durationMinimumMonths: number;
  readonly durationMaximumMonths: number;
  readonly arrangementFeeCents: number;
  readonly insuranceMandatory: boolean;
  readonly scoreThreshold: number;
}

export class Product extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ProductState,
  ) {
    super(id);
  }

  static create(id: string, terms: ProductTerms, now: Date): Product {
    const created = new Product(id, {
      registeredAt: now,
      amountMinimumCents: terms.amount.minimumCents,
      amountMaximumCents: terms.amount.maximumCents,
      durationMinimumMonths: terms.duration.minimumMonths,
      durationMaximumMonths: terms.duration.maximumMonths,
      arrangementFeeCents: terms.arrangementFee.cents,
      insuranceMandatory: terms.insuranceMandatory,
      scoreThreshold: terms.scoreThreshold.score,
    });

    created.record(
      new ProductDefined(id, now, {
        amountMinimumCents: terms.amount.minimumCents,
        amountMaximumCents: terms.amount.maximumCents,
        durationMinimumMonths: terms.duration.minimumMonths,
        durationMaximumMonths: terms.duration.maximumMonths,
        arrangementFeeCents: terms.arrangementFee.cents,
        insuranceMandatory: terms.insuranceMandatory,
      }),
    );

    return created;
  }

  static rehydrate(id: string, state: ProductState): Product {
    return new Product(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get amountMinimumCents(): number {
    return this.state.amountMinimumCents;
  }

  get amountMaximumCents(): number {
    return this.state.amountMaximumCents;
  }

  get durationMinimumMonths(): number {
    return this.state.durationMinimumMonths;
  }

  get durationMaximumMonths(): number {
    return this.state.durationMaximumMonths;
  }

  get arrangementFeeCents(): number {
    return this.state.arrangementFeeCents;
  }

  get insuranceMandatory(): boolean {
    return this.state.insuranceMandatory;
  }

  get scoreThreshold(): number {
    return this.state.scoreThreshold;
  }

  toState(): ProductState {
    return { ...this.state };
  }
}
