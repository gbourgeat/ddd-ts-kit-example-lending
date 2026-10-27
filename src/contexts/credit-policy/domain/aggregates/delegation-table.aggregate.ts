import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';

export interface DelegationTableState {
  readonly registeredAt: Date;
  readonly effectiveFrom: Date;
}

export class DelegationTable extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: DelegationTableState,
  ) {
    super(id);
  }

  static create(id: string, effectiveFrom: Date, now: Date): DelegationTable {
    const created = new DelegationTable(id, { registeredAt: now, effectiveFrom });

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

  toState(): DelegationTableState {
    return { ...this.state };
  }
}
