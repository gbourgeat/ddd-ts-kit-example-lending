import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanAlreadyClosed } from '@/contexts/servicing/ledger/domain/errors/loan-already-closed.error';
import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';
import type { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';

export type LoanEvent = LoanPaidOut | LoanClosed | LoanScheduled | LoanInstalmentDueNoted;

export interface LoanState {
  readonly registeredAt: Date;
  readonly closedAt: Date | undefined;
  readonly borrower: Borrower | undefined;
  readonly schedule: LoanSchedule | undefined;
  /** The numbers, counted from one, of the instalments already recorded as due. */
  readonly instalmentsDue: readonly number[];
  // TODO(domain): declare the rest of the state of Loan with value objects (a Money, a Period), not primitives: what its commands need to decide, nothing more.
}

export class Loan extends EventSourcedAggregate<LoanEvent, LoanState> {
  private state: LoanState = {
    registeredAt: new Date(0),
    closedAt: undefined,
    borrower: undefined,
    schedule: undefined,
    instalmentsDue: [],
  };

  private constructor(id: string) {
    super(id);
  }

  /** Gives birth to the loan at its payout, to its borrower, with the schedule of its instalments. */
  static create(
    id: string,
    payout: { readonly paidOutAt: Date; readonly borrower: Borrower; readonly schedule: LoanSchedule },
  ): Loan {
    const created = new Loan(id);

    created.record(new LoanPaidOut(id, payout.paidOutAt, payout.borrower));
    created.record(new LoanScheduled(id, payout.paidOutAt, payout.schedule));

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

  /**
   * Records each instalment of the schedule that has fallen due by `now` and is not recorded as due yet. Running it
   * again records nothing new; a closed loan has no instalment left to fall due.
   */
  computeDueInstalments(now: Date): void {
    if (this.state.closedAt !== undefined || this.state.schedule === undefined) {
      return;
    }

    for (const [index, amount] of this.state.schedule.instalments.entries()) {
      const number = index + 1;
      const dueOn = new InstalmentDueDateService().dueOn(this.state.registeredAt, number);

      if (dueOn.getTime() <= now.getTime() && !this.state.instalmentsDue.includes(number)) {
        this.record(new LoanInstalmentDueNoted(this.id, now, number, dueOn, amount));
      }
    }
  }

  /** Whether the loan was closed on or before the instant: its retention then runs out. */
  closedOnOrBefore(instant: Date): boolean {
    return this.state.closedAt !== undefined && this.state.closedAt.getTime() <= instant.getTime();
  }

  // TODO(domain): add one method per remaining business intention (payments, early repayment): it checks its invariants on `this.state`, then records what it decided, `this.record(new Loan<Fact>(this.id, now, ...))`, after `ddd-ts-kit generate domain-event servicing Loan <Fact>` added the event and its apply method. It never writes the state itself (event-sourcing/state-in-apply).

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get closedAt(): Date | undefined {
    return this.state.closedAt;
  }

  get borrower(): Borrower | undefined {
    return this.state.borrower;
  }

  get schedule(): LoanSchedule | undefined {
    return this.state.schedule;
  }

  get instalmentsDue(): readonly number[] {
    return this.state.instalmentsDue;
  }

  toState(): LoanState {
    return { ...this.state };
  }

  protected appliers(): Appliers<LoanEvent> {
    return {
      [LoanPaidOut.eventName]: (event) => this.applyPaidOut(event),
      [LoanScheduled.eventName]: (event) => this.applyScheduled(event),
      [LoanClosed.eventName]: (event) => this.applyClosed(event),
      [LoanInstalmentDueNoted.eventName]: (event) => this.applyInstalmentDueNoted(event),
    };
  }

  private restore(state: LoanState): void {
    this.state = state;
  }

  private applyPaidOut(event: LoanPaidOut): void {
    this.state = { ...this.state, registeredAt: event.occurredAt, borrower: event.borrower };
  }

  private applyScheduled(event: LoanScheduled): void {
    this.state = { ...this.state, schedule: event.schedule };
  }

  private applyClosed(event: LoanClosed): void {
    this.state = { ...this.state, closedAt: event.occurredAt };
  }

  private applyInstalmentDueNoted(event: LoanInstalmentDueNoted): void {
    this.state = { ...this.state, instalmentsDue: [...this.state.instalmentsDue, event.number] };
  }
}
