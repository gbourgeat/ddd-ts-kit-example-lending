import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { LoanRepaymentIncidentDeclared } from '@/contexts/servicing/arrears/domain/events/loan-repayment-incident-declared.event';
import { LoanRepaymentIncidentWithdrawn } from '@/contexts/servicing/arrears/domain/events/loan-repayment-incident-withdrawn.event';
import { LoanArrearsCleared } from '@/contexts/servicing/arrears/domain/events/loan-arrears-cleared.event';

/** The stored shape of a fact that carries nothing but its instant: its occurrence is its only data. */
type InstantOnlyData = Record<string, never>;

/** The repayment incident and arrears events of Loan, composed into the events of its stream by `loanEvents`. */
export const repaymentIncidentEvents: StoredEventTypes<
  LoanRepaymentIncidentDeclared | LoanRepaymentIncidentWithdrawn | LoanArrearsCleared
> = {
  [LoanRepaymentIncidentDeclared.eventName]: defineStoredEvent(LoanRepaymentIncidentDeclared, {
    version: 1,
    encode: (): InstantOnlyData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanRepaymentIncidentDeclared(aggregateId, occurredAt),
  }),
  [LoanRepaymentIncidentWithdrawn.eventName]: defineStoredEvent(LoanRepaymentIncidentWithdrawn, {
    version: 1,
    encode: (): InstantOnlyData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanRepaymentIncidentWithdrawn(aggregateId, occurredAt),
  }),
  [LoanArrearsCleared.eventName]: defineStoredEvent(LoanArrearsCleared, {
    version: 1,
    encode: (): InstantOnlyData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new LoanArrearsCleared(aggregateId, occurredAt),
  }),
};
