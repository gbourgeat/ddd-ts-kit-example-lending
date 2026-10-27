import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { ResidualIncomeMinimumPublished } from '@/contexts/credit-policy/domain/events/residual-income-minimum-published.event';

export interface ResidualIncomeMinimumState {
  readonly registeredAt: Date;
  readonly perAdultInCents: number;
  readonly perChildInCents: number;
  readonly effectiveFrom: Date;
}

export class ResidualIncomeMinimum extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ResidualIncomeMinimumState,
  ) {
    super(id);
  }

  static create(
    id: string,
    rule: Pick<ResidualIncomeMinimumState, 'perAdultInCents' | 'perChildInCents' | 'effectiveFrom'>,
    now: Date,
  ): ResidualIncomeMinimum {
    const created = new ResidualIncomeMinimum(id, { registeredAt: now, ...rule });

    created.record(new ResidualIncomeMinimumPublished(id, now));

    return created;
  }

  static rehydrate(id: string, state: ResidualIncomeMinimumState): ResidualIncomeMinimum {
    return new ResidualIncomeMinimum(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get perAdultInCents(): number {
    return this.state.perAdultInCents;
  }

  get perChildInCents(): number {
    return this.state.perChildInCents;
  }

  get effectiveFrom(): Date {
    return this.state.effectiveFrom;
  }

  toState(): ResidualIncomeMinimumState {
    return { ...this.state };
  }
}
