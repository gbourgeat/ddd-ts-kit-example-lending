import { AggregateRoot } from '@ddd-ts-kit/kernel';

export interface OfferState {
  readonly registeredAt: Date;
  // TODO(domain): declare the rest of the state of Offer with value objects (a Money, a Period), not primitives.
}

export class Offer extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: OfferState,
  ) {
    super(id);
  }

  static create(id: string, now: Date): Offer {
    // TODO(domain): take the facts known at birth as parameters, check each birth invariant and throw the refusal named after it when one is violated: `throw <Refusal>.for<Fact>(...)`, written with `ddd-ts-kit generate error credit-application <Refusal> <factory>`.
    const created = new Offer(id, { registeredAt: now });

    // TODO(domain): record the birth fact with `created.record(new OfferCreated(id, now))` after `ddd-ts-kit generate domain-event credit-application Offer Created`.
    return created;
  }

  static rehydrate(id: string, state: OfferState): Offer {
    return new Offer(id, state);
  }

  // TODO(domain): add one method per business intention (issue, cancel, ...): each guards its invariants, replaces `this.state` and records the event of what happened.

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  toState(): OfferState {
    return { ...this.state };
  }
}
