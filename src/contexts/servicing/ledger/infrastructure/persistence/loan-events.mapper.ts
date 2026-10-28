import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';

// TODO(domain): give each data type the fields its event carries beyond its id and instant, in plain data (texts, numbers, ISO dates); personal data is written `personalData(subjectId, value)`. A type stored once never changes: a change is a new version with its upcaster (event-sourcing/upcaster-required).
type LoanPaidOutData = Record<string, never>;

type LoanClosedData = Record<string, never>;

/** How the events of Loan are kept in its stream: one entry per event, read back by `decode`. */
export const loanEvents: StoredEventTypes<LoanEvent> = {
  [LoanPaidOut.eventName]: defineStoredEvent(LoanPaidOut, {
    version: 1,
    encode: (): LoanPaidOutData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanPaidOut(aggregateId, occurredAt),
  }),
  [LoanClosed.eventName]: defineStoredEvent(LoanClosed, {
    version: 1,
    encode: (): LoanClosedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanClosed(aggregateId, occurredAt),
  }),
};
