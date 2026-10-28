import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanAlreadyClosed } from '@/contexts/servicing/ledger/domain/errors/loan-already-closed.error';

export type LoanEvent = LoanPaidOut | LoanClosed;

export interface LoanState {
  readonly registeredAt: Date;
  readonly closedAt: Date | undefined;
  // TODO(domain): declare the rest of the state of Loan with value objects (a Money, a Period), not primitives: what its commands need to decide, nothing more.
}

export class Loan extends EventSourcedAggregate<LoanEvent, LoanState> {
  private state: LoanState = { registeredAt: new Date(0), closedAt: undefined };

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, now: Date): Loan {
    // TODO(domain): take the facts known at birth as parameters, check each birth invariant and throw the refusal named after it when one is violated: `throw <Refusal>.for<Fact>(...)`, written with `ddd-ts-kit generate error servicing <Refusal> <factory>`.
    const created = new Loan(id);

    created.record(new LoanPaidOut(id, now));

    return created;
  }

  static rehydrate(id: string, history: AggregateHistory<LoanEvent, LoanState>): Loan {
    const loaded = new Loan(id);

    return loaded.replay(history, (state) => loaded.restore(state));
  }

  /** Closes the loan: its ledger is over, and it can be closed once. */
  close(now: Date): void {
    if (this.state.closedAt !== undefined) {
      throw LoanAlreadyClosed.forLoan(this.id);
    }

    this.record(new LoanClosed(this.id, now));
  }

  // TODO(domain): add one method per remaining business intention (payout schedule, instalments, payments, early repayment): it checks its invariants on `this.state`, then records what it decided, `this.record(new Loan<Fact>(this.id, now, ...))`, after `ddd-ts-kit generate domain-event servicing Loan <Fact>` added the event and its apply method. It never writes the state itself (event-sourcing/state-in-apply).

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get closedAt(): Date | undefined {
    return this.state.closedAt;
  }

  toState(): LoanState {
    return { ...this.state };
  }

  protected appliers(): Appliers<LoanEvent> {
    return {
      [LoanPaidOut.eventName]: (event) => this.applyPaidOut(event),
      [LoanClosed.eventName]: (event) => this.applyClosed(event),
    };
  }

  private restore(state: LoanState): void {
    this.state = state;
  }

  private applyPaidOut(event: LoanPaidOut): void {
    this.state = { ...this.state, registeredAt: event.occurredAt };
  }

  private applyClosed(event: LoanClosed): void {
    this.state = { ...this.state, closedAt: event.occurredAt };
  }
}
