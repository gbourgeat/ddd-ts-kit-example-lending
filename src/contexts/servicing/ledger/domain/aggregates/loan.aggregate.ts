import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { LoanWriteOffReversed } from '@/contexts/servicing/ledger/domain/events/loan-write-off-reversed.event';
import { LoanAlreadyClosed } from '@/contexts/servicing/ledger/domain/errors/loan-already-closed.error';
import { InvalidRepayment } from '@/contexts/servicing/ledger/domain/errors/invalid-repayment.error';
import { EarlyRepaymentTooHigh } from '@/contexts/servicing/ledger/domain/errors/early-repayment-too-high.error';
import { LoanNotWrittenOff } from '@/contexts/servicing/ledger/domain/errors/loan-not-written-off.error';
import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';
import { EarlyRepaymentFeeService } from '@/contexts/servicing/ledger/domain/services/early-repayment-fee.service';
import { OutstandingCapitalService } from '@/contexts/servicing/ledger/domain/services/outstanding-capital.service';
import type { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

export type LoanEvent =
  | LoanPaidOut
  | LoanClosed
  | LoanScheduled
  | LoanInstalmentDueNoted
  | LoanEarlyRepaymentRecorded
  | LoanWrittenOff
  | LoanWriteOffReversed;

export interface LoanState {
  readonly registeredAt: Date;
  readonly closedAt: Date | undefined;
  readonly borrower: Borrower | undefined;
  readonly schedule: LoanSchedule | undefined;
  /** The numbers, counted from one, of the instalments already recorded as due. */
  readonly instalmentsDue: readonly number[];
  /** The capital repaid early, over the life of the loan. */
  readonly earlyRepaid: Money;
  /** The outstanding capital written off, while the write-off stands; undefined once reversed or never written off. */
  readonly writtenOff: Money | undefined;
}

export class Loan extends EventSourcedAggregate<LoanEvent, LoanState> {
  private state: LoanState = {
    registeredAt: new Date(0),
    closedAt: undefined,
    borrower: undefined,
    schedule: undefined,
    instalmentsDue: [],
    earlyRepaid: Money.ofCents(0),
    writtenOff: undefined,
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

  /**
   * Repays capital early at `now`: the fee is charged on the capital, and repaying the whole outstanding capital closes
   * the loan in the same ledger entry sequence. A repayment above the outstanding capital is refused.
   */
  repayEarly(capital: Money, now: Date): void {
    if (this.state.closedAt !== undefined) {
      throw LoanAlreadyClosed.forLoan(this.id);
    }

    if (capital.cents <= 0) {
      throw InvalidRepayment.forAmount(capital.cents);
    }

    const outstanding = this.outstandingCapital;

    if (capital.cents > outstanding.cents) {
      throw EarlyRepaymentTooHigh.forRepayment(capital.cents, outstanding.cents);
    }

    const fee = new EarlyRepaymentFeeService().of(capital, this.monthsRemaining(now));

    this.record(new LoanEarlyRepaymentRecorded(this.id, now, capital, fee));

    if (capital.cents === outstanding.cents) {
      this.close(now);
    }
  }

  /** Writes off the outstanding capital at `now`: the loan ends, until the write-off is reversed. */
  writeOff(now: Date): void {
    if (this.state.closedAt !== undefined) {
      throw LoanAlreadyClosed.forLoan(this.id);
    }

    this.record(new LoanWrittenOff(this.id, now, this.outstandingCapital));
  }

  /** Reverses the write-off by a movement of opposite effect: the earlier write-off stays in the ledger, unedited. */
  reverseWriteOff(now: Date): void {
    if (this.state.writtenOff === undefined) {
      throw LoanNotWrittenOff.forLoan(this.id);
    }

    this.record(new LoanWriteOffReversed(this.id, now, this.state.writtenOff));
  }

  /** Whether the loan was closed on or before the instant: its retention then runs out. */
  closedOnOrBefore(instant: Date): boolean {
    return this.state.closedAt !== undefined && this.state.closedAt.getTime() <= instant.getTime();
  }

  // TODO(domain): add one method per remaining business intention (payments, rescheduling): it checks its invariants on `this.state`, then records what it decided, `this.record(new Loan<Fact>(this.id, now, ...))`, after `ddd-ts-kit generate domain-event servicing Loan <Fact>` added the event and its apply method. It never writes the state itself (event-sourcing/state-in-apply).

  /** The capital still owed: the principal, less what the noted instalments repaid, the early repayments and the write-off. */
  get outstandingCapital(): Money {
    const schedule = this.state.schedule;

    if (schedule === undefined) {
      return Money.ofCents(0);
    }

    const writtenOff = this.state.writtenOff === undefined ? [] : [this.state.writtenOff];

    return new OutstandingCapitalService().of(schedule, this.state.instalmentsDue.length, [
      this.state.earlyRepaid,
      ...writtenOff,
    ]);
  }

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
      [LoanEarlyRepaymentRecorded.eventName]: (event) => this.applyEarlyRepaymentRecorded(event),
      [LoanWrittenOff.eventName]: (event) => this.applyWrittenOff(event),
      [LoanWriteOffReversed.eventName]: () => this.applyWriteOffReversed(),
    };
  }

  private restore(state: LoanState): void {
    this.state = state;
  }

  /** The months of the schedule still to run at `now`: its duration less the monthly due dates passed since the payout. */
  private monthsRemaining(now: Date): number {
    const duration = this.state.schedule?.durationMonths ?? 0;
    const dueDates = new InstalmentDueDateService();
    let elapsed = 0;

    while (elapsed < duration && dueDates.dueOn(this.state.registeredAt, elapsed + 1).getTime() <= now.getTime()) {
      elapsed += 1;
    }

    return duration - elapsed;
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

  private applyEarlyRepaymentRecorded(event: LoanEarlyRepaymentRecorded): void {
    this.state = { ...this.state, earlyRepaid: Money.ofCents(this.state.earlyRepaid.cents + event.capital.cents) };
  }

  private applyWrittenOff(event: LoanWrittenOff): void {
    this.state = { ...this.state, writtenOff: event.amount, closedAt: event.occurredAt };
  }

  private applyWriteOffReversed(): void {
    this.state = { ...this.state, writtenOff: undefined, closedAt: undefined };
  }
}
