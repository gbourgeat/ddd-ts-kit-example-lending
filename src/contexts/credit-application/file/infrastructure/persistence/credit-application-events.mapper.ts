import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';

interface CreditApplicationSubmittedData {
  readonly applicantId: string;
  readonly amountInCents: number;
  readonly durationMonths: number;
}

interface CreditApplicationAccountConsentGivenData {
  readonly expiresAt: string;
}

interface CreditApplicationCoBorrowerNamedData {
  readonly coBorrowerId: string;
}

interface CreditApplicationGuarantorNamedData {
  readonly guarantorId: string;
}

interface CreditApplicationEntryCorrectedData {
  readonly correctedEntryId: string;
  readonly reason: string;
}

interface CreditApplicationDocumentAttachedData {
  readonly documentKey: string;
  readonly mediaType: string;
  readonly sizeBytes: number;
}

/** How the events of CreditApplication are kept in its stream: one entry per event, read back by `decode`. */
export const creditApplicationEvents: StoredEventTypes<CreditApplicationEvent> = {
  [CreditApplicationSubmitted.eventName]: defineStoredEvent(CreditApplicationSubmitted, {
    version: 1,
    encode: (event): CreditApplicationSubmittedData => ({
      applicantId: event.applicantId,
      amountInCents: event.amount.cents,
      durationMonths: event.durationMonths,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationSubmitted(
        aggregateId,
        data.text('applicantId'),
        Money.ofCents(data.number('amountInCents')),
        data.number('durationMonths'),
        occurredAt,
      ),
  }),
  [CreditApplicationAccountConsentGiven.eventName]: defineStoredEvent(CreditApplicationAccountConsentGiven, {
    version: 1,
    encode: (event): CreditApplicationAccountConsentGivenData => ({ expiresAt: event.expiresAt.toISOString() }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationAccountConsentGiven(aggregateId, occurredAt, data.instant('expiresAt')),
  }),
  [CreditApplicationCoBorrowerNamed.eventName]: defineStoredEvent(CreditApplicationCoBorrowerNamed, {
    version: 1,
    encode: (event): CreditApplicationCoBorrowerNamedData => ({ coBorrowerId: event.coBorrowerId }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationCoBorrowerNamed(aggregateId, occurredAt, data.text('coBorrowerId')),
  }),
  [CreditApplicationGuarantorNamed.eventName]: defineStoredEvent(CreditApplicationGuarantorNamed, {
    version: 1,
    encode: (event): CreditApplicationGuarantorNamedData => ({ guarantorId: event.guarantorId }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationGuarantorNamed(aggregateId, occurredAt, data.text('guarantorId')),
  }),
  [CreditApplicationEntryCorrected.eventName]: defineStoredEvent(CreditApplicationEntryCorrected, {
    version: 1,
    encode: (event): CreditApplicationEntryCorrectedData => ({
      correctedEntryId: event.correctedEntryId,
      reason: event.reason,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationEntryCorrected(aggregateId, occurredAt, data.text('correctedEntryId'), data.text('reason')),
  }),
  [CreditApplicationDocumentAttached.eventName]: defineStoredEvent(CreditApplicationDocumentAttached, {
    version: 1,
    encode: (event): CreditApplicationDocumentAttachedData => ({
      documentKey: event.documentKey,
      mediaType: event.mediaType,
      sizeBytes: event.sizeBytes,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationDocumentAttached(
        aggregateId,
        occurredAt,
        data.text('documentKey'),
        data.text('mediaType'),
        data.number('sizeBytes'),
      ),
  }),
};
