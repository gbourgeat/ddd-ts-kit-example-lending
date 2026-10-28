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
import { DueInstalmentsService } from '@/contexts/servicing/ledger/domain/services/due-instalments.service';
import { EarlyRepaymentFeeService } from '@/contexts/servicing/ledger/domain/services/early-repayment-fee.service';
import { MonthsRemainingService } from '@/contexts/servicing/ledger/domain/services/months-remaining.service';
import { OutstandingCapitalService } from '@/contexts/servicing/ledger/domain/services/outstanding-capital.service';
import type { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { Money } from '@/shared-kernel/money.vo';
import { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import { LoanWithdrawalRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-withdrawal-repayment-recorded.event';
import { SimpleDailyInterestService } from '@/contexts/servicing/ledger/domain/services/simple-daily-interest.service';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';
import { initialLoanState } from '@/contexts/servicing/ledger/domain/values/initial-loan-state';
import { loanStateChanges } from '@/contexts/servicing/ledger/domain/values/loan-state-changes';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { ArrearsBucketService } from '@/contexts/servicing/ledger/domain/services/arrears-bucket.service';
import { DaysPastDueService } from '@/contexts/servicing/ledger/domain/services/days-past-due.service';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import { DefaultDecisionService } from '@/contexts/servicing/ledger/domain/services/default-decision.service';

export class Loan extends EventSourcedAggregate<LoanEvent, LoanState> {
  private state: LoanState = initialLoanState();

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
    this.assertOpen();

    this.record(new LoanClosed(this.id, now));
  }

  /** Records each instalment of the schedule fallen due by `now` and not yet recorded: running it again records nothing new. */
  computeDueInstalments(now: Date): void {
    const schedule = this.currentSchedule;

    if (this.state.closedAt !== undefined || schedule === undefined) {
      return;
    }

    const facts = {
      paidOutAt: this.state.registeredAt,
      notedBefore: this.notedBefore,
      alreadyDue: this.state.instalmentsDue,
    };

    for (const due of new DueInstalmentsService().of(schedule, facts, now)) {
      this.record(new LoanInstalmentDueNoted(this.id, now, due.number, due.dueOn, due.amount));
    }
  }

  /** Repays capital early at `now`: the fee is charged on the capital, and repaying the whole outstanding capital closes
the loan in the same ledger entry sequence. A repayment above the outstanding capital is refused. */
  repayEarly(capital: Money, now: Date): void {
    this.assertOpen();

    if (capital.cents <= 0) {
      throw InvalidRepayment.forAmount(capital.cents);
    }

    const outstanding = this.outstandingCapital;

    if (capital.cents > outstanding.cents) {
      throw EarlyRepaymentTooHigh.forRepayment(capital.cents, outstanding.cents);
    }

    const fee = new EarlyRepaymentFeeService().of(capital, new MonthsRemainingService().ofLoan(this.state, now));

    this.record(new LoanEarlyRepaymentRecorded(this.id, now, capital, fee));

    if (capital.cents === outstanding.cents) {
      this.close(now);
    }
  }

  /** Writes off the outstanding capital at `now`: the loan ends, until the write-off is reversed. */
  writeOff(now: Date): void {
    this.assertOpen();

    this.record(new LoanWrittenOff(this.id, now, this.outstandingCapital));
  }

  /** Reverses the write-off by a movement of opposite effect: the earlier write-off stays in the ledger, unedited. */
  reverseWriteOff(now: Date): void {
    if (this.state.writtenOff === undefined) {
      throw LoanNotWrittenOff.forLoan(this.id);
    }

    this.record(new LoanWriteOffReversed(this.id, now, this.state.writtenOff));
  }

  /** Reschedules the outstanding capital over the new duration, at the rate of the loan. The instalments noted due keep
their record; the earlier schedule stays in the ledger. A decision already recorded is not recorded again. */
  reschedule(
    decision: { readonly id: string; readonly capital: Money; readonly durationMonths: number },
    now: Date,
  ): void {
    if (this.state.rescheduledBy.includes(decision.id)) {
      return;
    }

    this.assertOpen();

    const rate = this.state.schedule?.annualRateBasisPoints ?? 0;
    const schedule = LoanSchedule.of(decision.capital, rate, decision.durationMonths);

    this.record(new LoanRescheduled(this.id, now, decision.id, schedule));
  }

  /** Repays the loan on the withdrawal of its application: the capital as paid out, and the interest accrued since the
payout, then closes it. A loan already closed has nothing left to repay, so a delivery seen again records nothing. */
  repayOnWithdrawal(withdrawnAt: Date): void {
    const schedule = this.state.schedule;

    if (this.state.closedAt !== undefined || schedule === undefined) {
      return;
    }

    const interest = new SimpleDailyInterestService().of(
      schedule.principal,
      schedule.annualRateBasisPoints,
      this.state.registeredAt,
      withdrawnAt,
    );

    this.record(new LoanWithdrawalRepaymentRecorded(this.id, withdrawnAt, schedule.principal, interest));
    this.close(withdrawnAt);
  }

  /** Whether the loan was closed on or before the instant: its retention then runs out. */
  closedOnOrBefore(instant: Date): boolean {
    return this.state.closedAt !== undefined && this.state.closedAt.getTime() <= instant.getTime();
  }

  /** Whether the instalment is noted due and not settled yet: the only instalment a direct debit collects. */
  isCollectable(number: number): boolean {
    const { instalmentsDue, instalmentsPaid, instalmentsUnpaid } = this.state;

    return instalmentsDue.includes(number) && !instalmentsPaid.includes(number) && !instalmentsUnpaid.includes(number);
  }

  /** Records the money of a due instalment received by direct debit; an instalment already settled records nothing. */
  recordPayment(number: number, amount: Money, now: Date): void {
    if (this.isCollectable(number)) {
      this.record(new LoanPaymentReceived(this.id, now, number, amount));
    }
  }

  /** Marks a due instalment unpaid after its direct debit was rejected: the instalment is not retried. */
  markUnpaid(number: number, now: Date): void {
    if (this.isCollectable(number)) {
      this.record(new LoanInstalmentMarkedUnpaid(this.id, now, number));
    }
  }

  /** Places the loan in the arrears bucket its days past due put it in at `now`: recorded only when the bucket changed. */
  classifyArrears(now: Date): void {
    if (this.state.closedAt !== undefined) {
      return;
    }

    const bucket = new ArrearsBucketService().of(new DaysPastDueService().of(this.state, now));

    if (bucket !== this.state.arrearsBucket) {
      this.record(new LoanArrearsBucketEntered(this.id, now, bucket));
    }
  }

  /** Declares the loan in default once its days past due reach the limit: handed to collections, and declared once. */
  declareDefault(now: Date): void {
    if (new DefaultDecisionService().isDeclaredAt(this.state, now)) {
      this.record(new LoanDefaulted(this.id, now));
    }
  }

  /** The capital still owed: the principal, less what the noted instalments repaid, the early repayments and the write-off. */
  get outstandingCapital(): Money {
    return new OutstandingCapitalService().ofLoan(this.state);
  }

  /** The schedule in force: the one of the payout, or the one that replaced it at the last rescheduling. */
  get currentSchedule(): LoanSchedule | undefined {
    return this.state.rescheduling?.schedule ?? this.state.schedule;
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

  get instalmentsPaid(): readonly number[] {
    return this.state.instalmentsPaid;
  }

  get instalmentsUnpaid(): readonly number[] {
    return this.state.instalmentsUnpaid;
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
      [LoanRescheduled.eventName]: (event) => this.applyRescheduled(event),
      [LoanWithdrawalRepaymentRecorded.eventName]: () => this.applyWithdrawalRepaymentRecorded(),
      [LoanPaymentReceived.eventName]: (event) => this.applyPaymentReceived(event),
      [LoanInstalmentMarkedUnpaid.eventName]: (event) => this.applyInstalmentMarkedUnpaid(event),
      [LoanArrearsBucketEntered.eventName]: (event) => this.applyArrearsBucketEntered(event),
      [LoanDefaulted.eventName]: (event) => this.applyDefaulted(event),
    };
  }

  private restore(state: LoanState): void {
    this.state = state;
  }

  /** A closed loan takes no more movements. */
  private assertOpen(): void {
    if (this.state.closedAt !== undefined) {
      throw LoanAlreadyClosed.forLoan(this.id);
    }
  }

  /** The instalments noted due before the schedule in force: its instalments are numbered after them. */
  private get notedBefore(): number {
    return this.state.rescheduling?.notedBefore ?? 0;
  }

  private applyPaidOut(event: LoanPaidOut): void {
    this.state = loanStateChanges.paidOut(this.state, event);
  }

  private applyScheduled(event: LoanScheduled): void {
    this.state = loanStateChanges.scheduled(this.state, event);
  }

  private applyClosed(event: LoanClosed): void {
    this.state = loanStateChanges.closed(this.state, event);
  }

  private applyInstalmentDueNoted(event: LoanInstalmentDueNoted): void {
    this.state = loanStateChanges.instalmentDueNoted(this.state, event);
  }

  private applyEarlyRepaymentRecorded(event: LoanEarlyRepaymentRecorded): void {
    this.state = loanStateChanges.earlyRepaymentRecorded(this.state, event);
  }

  private applyWrittenOff(event: LoanWrittenOff): void {
    this.state = loanStateChanges.writtenOff(this.state, event);
  }

  private applyWriteOffReversed(): void {
    this.state = loanStateChanges.writeOffReversed(this.state);
  }

  private applyRescheduled(event: LoanRescheduled): void {
    this.state = loanStateChanges.rescheduled(this.state, event);
  }

  /** The capital and the interest are paid: the loan ends with the closure recorded right after, so no state moves here. */
  private applyWithdrawalRepaymentRecorded(): void {
    this.state = loanStateChanges.withdrawalRepaymentRecorded(this.state);
  }

  private applyPaymentReceived(event: LoanPaymentReceived): void {
    this.state = loanStateChanges.paymentReceived(this.state, event);
  }

  private applyInstalmentMarkedUnpaid(event: LoanInstalmentMarkedUnpaid): void {
    this.state = loanStateChanges.instalmentMarkedUnpaid(this.state, event);
  }

  private applyArrearsBucketEntered(event: LoanArrearsBucketEntered): void {
    this.state = loanStateChanges.arrearsBucketEntered(this.state, event);
  }

  private applyDefaulted(event: LoanDefaulted): void {
    this.state = loanStateChanges.defaulted(this.state, event);
  }
}
