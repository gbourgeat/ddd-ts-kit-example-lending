import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { arrearsBucketOf } from '@/contexts/servicing/ledger/infrastructure/persistence/arrears-bucket-of.mapper';

/** The bucket the loan was placed in, kept by its name in the vocabulary. */
interface LoanArrearsBucketEnteredData {
  readonly bucket: string;
}

/** The arrears events of Loan, composed into the events of its stream by `loanEvents`. */
export const arrearsEvents: StoredEventTypes<LoanArrearsBucketEntered> = {
  [LoanArrearsBucketEntered.eventName]: defineStoredEvent(LoanArrearsBucketEntered, {
    version: 1,
    encode: (event): LoanArrearsBucketEnteredData => ({ bucket: event.bucket }),
    decode: (data, { aggregateId, occurredAt }) =>
      new LoanArrearsBucketEntered(aggregateId, occurredAt, arrearsBucketOf(data.text('bucket'))),
  }),
};
