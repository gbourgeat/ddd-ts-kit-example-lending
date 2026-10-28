import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import { arrearsBucketOf } from '@/contexts/servicing/ledger/infrastructure/persistence/arrears-bucket-of.mapper';

/** The bucket the loan was placed in, kept by its name in the vocabulary. */
interface LoanArrearsBucketEnteredData {
  readonly bucket: string;
}

/** The stored shape of a default: the fact is its instant alone. */
type LoanDefaultedData = Record<string, never>;

/** The arrears events of Loan, composed into the events of its stream by `loanEvents`. */
export const arrearsEvents: StoredEventTypes<LoanArrearsBucketEntered | LoanDefaulted> = {
  [LoanArrearsBucketEntered.eventName]: defineStoredEvent(LoanArrearsBucketEntered, {
    version: 1,
    encode: (event): LoanArrearsBucketEnteredData => ({ bucket: event.bucket }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanArrearsBucketEntered(aggregateId, occurredAt, arrearsBucketOf(data.text('bucket'))),
  }),
  [LoanDefaulted.eventName]: defineStoredEvent(LoanDefaulted, {
    version: 1,
    encode: (): LoanDefaultedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanDefaulted(aggregateId, occurredAt),
  }),
};
