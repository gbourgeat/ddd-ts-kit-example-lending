import { AggregateRoot } from '@ddd-ts-kit/kernel';

export interface ImpactAssessmentState {
  readonly registeredAt: Date;
  // TODO(domain): declare the rest of the state of ImpactAssessment with value objects (a Money, a Period), not primitives.
}

export class ImpactAssessment extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ImpactAssessmentState,
  ) {
    super(id);
  }

  static create(id: string, now: Date): ImpactAssessment {
    // TODO(domain): take the facts known at birth as parameters, check each birth invariant and throw the refusal named after it when one is violated: `throw <Refusal>.for<Fact>(...)`, written with `ddd-ts-kit generate error data-protection <Refusal> <factory>`.
    const created = new ImpactAssessment(id, { registeredAt: now });

    // TODO(domain): record the birth fact with `created.record(new ImpactAssessmentCreated(id, now))` after `ddd-ts-kit generate domain-event data-protection ImpactAssessment Created`.
    return created;
  }

  static rehydrate(id: string, state: ImpactAssessmentState): ImpactAssessment {
    return new ImpactAssessment(id, state);
  }

  // TODO(domain): add one method per business intention (issue, cancel, ...): each guards its invariants, replaces `this.state` and records the event of what happened.

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  toState(): ImpactAssessmentState {
    return { ...this.state };
  }
}
