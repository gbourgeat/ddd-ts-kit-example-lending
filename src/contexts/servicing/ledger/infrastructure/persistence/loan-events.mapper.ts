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
