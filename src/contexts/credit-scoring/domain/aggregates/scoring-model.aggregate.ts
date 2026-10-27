import { AggregateRoot } from '@ddd-ts-kit/kernel';

export interface ScoringModelState {
  readonly registeredAt: Date;
  // TODO(domain): declare the rest of the state of ScoringModel with value objects (a Money, a Period), not primitives.
}

export class ScoringModel extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ScoringModelState,
  ) {
    super(id);
  }

  static create(id: string, now: Date): ScoringModel {
    // TODO(domain): take the facts known at birth as parameters, check each birth invariant and throw the refusal named after it when one is violated: `throw <Refusal>.for<Fact>(...)`, written with `ddd-ts-kit generate error credit-scoring <Refusal> <factory>`.
    const created = new ScoringModel(id, { registeredAt: now });

    // TODO(domain): record the birth fact with `created.record(new ScoringModelCreated(id, now))` after `ddd-ts-kit generate domain-event credit-scoring ScoringModel Created`.
    return created;
  }

  static rehydrate(id: string, state: ScoringModelState): ScoringModel {
    return new ScoringModel(id, state);
  }

  // TODO(domain): add one method per business intention (issue, cancel, ...): each guards its invariants, replaces `this.state` and records the event of what happened.

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  toState(): ScoringModelState {
    return { ...this.state };
  }
}
