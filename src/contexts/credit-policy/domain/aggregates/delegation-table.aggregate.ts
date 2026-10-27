import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';
import type { DelegationTableTerms } from '@/contexts/credit-policy/domain/value-objects/delegation-table-terms.vo';

export interface DelegationLimitState {
  readonly level: string;
  readonly amountCents: number;
}

export interface DelegationTableState {
  readonly registeredAt: Date;
  readonly effectiveFrom: Date;
  readonly levels: readonly DelegationLimitState[];
}

export class DelegationTable extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: DelegationTableState,
  ) {
    super(id);
  }

  static create(id: string, terms: DelegationTableTerms, now: Date): DelegationTable {
    const created = new DelegationTable(id, {
      registeredAt: now,
      effectiveFrom: terms.effectiveFrom,
      levels: terms.limits.map((limit) => ({ level: limit.level, amountCents: limit.amountCents })),
    });

    created.record(new DelegationTablePublished(id, now));

    return created;
  }

  static rehydrate(id: string, state: DelegationTableState): DelegationTable {
    return new DelegationTable(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get effectiveFrom(): Date {
    return this.state.effectiveFrom;
  }

  get levels(): readonly DelegationLimitState[] {
    return this.state.levels;
  }

  toState(): DelegationTableState {
    return { ...this.state };
  }
}
