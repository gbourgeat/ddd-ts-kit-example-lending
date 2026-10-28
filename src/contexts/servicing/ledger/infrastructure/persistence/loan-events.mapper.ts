import {
  defineStoredEvent,
  personalData,
  type PersonalValue,
  type StoredEventData,
  type StoredEventTypes,
} from '@ddd-ts-kit/kernel';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { LoanWriteOffReversed } from '@/contexts/servicing/ledger/domain/events/loan-write-off-reversed.event';
import { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import { LoanWithdrawalRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-withdrawal-repayment-recorded.event';

/** The capital repaid on the withdrawal and the interest accrued to it, in whole cents. */
interface LoanWithdrawalRepaymentRecordedData {
  readonly capitalCents: number;
  readonly interestCents: number;
}

/** The decision that rescheduled the loan, and the schedule that replaces the one in force. */
interface LoanRescheduledData {
  readonly decisionId: string;
  readonly schedule: LoanScheduledData;
}

/** The capital repaid early and the fee charged on it, in whole cents. */
interface LoanEarlyRepaymentRecordedData {
  readonly capitalCents: number;
  readonly feeCents: number;
}

/** The amount written off, in whole cents. */
interface LoanAmountData {
  readonly amountCents: number;
}

/** An instalment noted as due: its number in the schedule, its due date as text and its amount, in whole cents. */
interface LoanInstalmentDueNotedData {
  readonly number: number;
  readonly dueOn: string;
  readonly amountCents: number;
}

/** The schedule of the loan, in whole cents: no personal value, so it is kept as it is. */
interface LoanScheduledData {
  readonly principalCents: number;
  readonly annualRateBasisPoints: number;
  readonly durationMonths: number;
  readonly instalments: { readonly cents: number }[];
}

/** The borrower of the payout: its name and postal address are personal, sealed by the subject of the loan. */
interface BorrowerData {
  readonly name: PersonalValue;
  readonly postalAddress: PersonalValue;
}

/** Version 2 of the payout: `borrowerRecorded` is false for a payout upcast from version 1, which recorded no borrower. */
interface LoanPaidOutData {
  readonly borrowerRecorded: boolean;
  readonly borrower: BorrowerData | null;
}

type LoanClosedData = Record<string, never>;

/** An instalment whose direct debit was accepted: its number in the schedule and the money collected, in whole cents. */
interface LoanPaymentReceivedData {
  readonly number: number;
  readonly amountCents: number;
}

/** An instalment whose direct debit was rejected: its number in the schedule. */
interface LoanInstalmentMarkedUnpaidData {
  readonly number: number;
}

/** How the events of Loan are kept in its stream: one entry per event, read back by `decode`. */
export const loanEvents: StoredEventTypes<LoanEvent> = {
  [LoanPaidOut.eventName]: defineStoredEvent(LoanPaidOut, {
    version: 2,
    upcasters: {
      // A payout of version 1 recorded no borrower: it is read as not recorded.
      1: () => ({ borrowerRecorded: false, borrower: null }),
    },
    encode: (event): LoanPaidOutData => ({
      borrowerRecorded: event.borrower !== undefined,
      borrower: event.borrower === undefined ? null : borrowerDataOf(event.aggregateId, event.borrower),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanPaidOut(
        aggregateId,
        occurredAt,
        data.flag('borrowerRecorded') ? borrowerOf(data.record('borrower')) : undefined,
      ),
  }),
  [LoanClosed.eventName]: defineStoredEvent(LoanClosed, {
    version: 1,
    encode: (): LoanClosedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanClosed(aggregateId, occurredAt),
  }),
  [LoanScheduled.eventName]: defineStoredEvent(LoanScheduled, {
    version: 1,
    encode: (event): LoanScheduledData => ({
      principalCents: event.schedule.principal.cents,
      annualRateBasisPoints: event.schedule.annualRateBasisPoints,
      durationMonths: event.schedule.durationMonths,
      instalments: event.schedule.instalments.map((instalment) => ({ cents: instalment.cents })),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanScheduled(
        aggregateId,
        occurredAt,
        LoanSchedule.recorded({
          principal: Money.ofCents(data.number('principalCents')),
          annualRateBasisPoints: data.number('annualRateBasisPoints'),
          durationMonths: data.number('durationMonths'),
          instalments: data.records('instalments').map((instalment) => Money.ofCents(instalment.number('cents'))),
        }),
      ),
  }),
  [LoanInstalmentDueNoted.eventName]: defineStoredEvent(LoanInstalmentDueNoted, {
    version: 1,
    encode: (event): LoanInstalmentDueNotedData => ({
      number: event.number,
      dueOn: event.dueOn.toISOString(),
      amountCents: event.amount.cents,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanInstalmentDueNoted(
        aggregateId,
        occurredAt,
        data.number('number'),
        new Date(data.text('dueOn')),
        Money.ofCents(data.number('amountCents')),
      ),
  }),
  [LoanEarlyRepaymentRecorded.eventName]: defineStoredEvent(LoanEarlyRepaymentRecorded, {
    version: 1,
    encode: (event): LoanEarlyRepaymentRecordedData => ({
      capitalCents: event.capital.cents,
      feeCents: event.fee.cents,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanEarlyRepaymentRecorded(
        aggregateId,
        occurredAt,
        Money.ofCents(data.number('capitalCents')),
        Money.ofCents(data.number('feeCents')),
      ),
  }),
  [LoanWrittenOff.eventName]: defineStoredEvent(LoanWrittenOff, {
    version: 1,
    encode: (event): LoanAmountData => ({ amountCents: event.amount.cents }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanWrittenOff(aggregateId, occurredAt, Money.ofCents(data.number('amountCents'))),
  }),
  [LoanWriteOffReversed.eventName]: defineStoredEvent(LoanWriteOffReversed, {
    version: 1,
    encode: (event): LoanAmountData => ({ amountCents: event.amount.cents }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanWriteOffReversed(aggregateId, occurredAt, Money.ofCents(data.number('amountCents'))),
  }),
  [LoanRescheduled.eventName]: defineStoredEvent(LoanRescheduled, {
    version: 1,
    encode: (event): LoanRescheduledData => ({
      decisionId: event.decisionId,
      schedule: scheduleDataOf(event.schedule),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanRescheduled(aggregateId, occurredAt, data.text('decisionId'), scheduleOf(data.record('schedule'))),
  }),
  [LoanWithdrawalRepaymentRecorded.eventName]: defineStoredEvent(LoanWithdrawalRepaymentRecorded, {
    version: 1,
    encode: (event): LoanWithdrawalRepaymentRecordedData => ({
      capitalCents: event.capital.cents,
      interestCents: event.interest.cents,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanWithdrawalRepaymentRecorded(
        aggregateId,
        occurredAt,
        Money.ofCents(data.number('capitalCents')),
        Money.ofCents(data.number('interestCents')),
      ),
  }),
  [LoanPaymentReceived.eventName]: defineStoredEvent(LoanPaymentReceived, {
    version: 1,
    encode: (event): LoanPaymentReceivedData => ({ number: event.number, amountCents: event.amount.cents }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanPaymentReceived(
        aggregateId,
        occurredAt,
        data.number('number'),
        Money.ofCents(data.number('amountCents')),
      ),
  }),
  [LoanInstalmentMarkedUnpaid.eventName]: defineStoredEvent(LoanInstalmentMarkedUnpaid, {
    version: 1,
    encode: (event): LoanInstalmentMarkedUnpaidData => ({ number: event.number }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanInstalmentMarkedUnpaid(aggregateId, occurredAt, data.number('number')),
  }),
};

/** The schedule of the loan, in whole cents: the same shape for the payout and for a rescheduling. */
function scheduleDataOf(schedule: LoanSchedule): LoanScheduledData {
  return {
    principalCents: schedule.principal.cents,
    annualRateBasisPoints: schedule.annualRateBasisPoints,
    durationMonths: schedule.durationMonths,
    instalments: schedule.instalments.map((instalment) => ({ cents: instalment.cents })),
  };
}

function scheduleOf(data: StoredEventData): LoanSchedule {
  return LoanSchedule.recorded({
    principal: Money.ofCents(data.number('principalCents')),
    annualRateBasisPoints: data.number('annualRateBasisPoints'),
    durationMonths: data.number('durationMonths'),
    instalments: data.records('instalments').map((instalment) => Money.ofCents(instalment.number('cents'))),
  });
}

/** The name and the postal address of the borrower, sealed by the subject of the loan. */
function borrowerDataOf(subject: string, borrower: Borrower): BorrowerData {
  return {
    name: personalData(subject, borrower.name),
    postalAddress: personalData(subject, borrower.postalAddress),
  };
}

function borrowerOf(data: StoredEventData): Borrower {
  return Borrower.create(data.text('name'), data.text('postalAddress'));
}
