import {
  defineStoredEvent,
  personalData,
  type PersonalValue,
  type StoredEventData,
  type StoredEventTypes,
} from '@ddd-ts-kit/kernel';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';

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
};

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
