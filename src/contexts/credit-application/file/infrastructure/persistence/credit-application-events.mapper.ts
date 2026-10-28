import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/values/credit-application-event';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';
import { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';
import { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { CreditApplicationRequestFoundOutsideProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-found-outside-product-terms.event';
import { CreditApplicationRequestCheckedWithUnknownProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-checked-with-unknown-product-terms.event';
import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { CreditApplicationBrought } from '@/contexts/credit-application/file/domain/events/credit-application-brought.event';
import { CreditApplicationExceptionRequested } from '@/contexts/credit-application/file/domain/events/credit-application-exception-requested.event';

interface CreditApplicationSubmittedData {
  readonly applicantId: string;
  readonly amountInCents: number;
  readonly durationMonths: number;
  readonly branchId: string;
  readonly productId: string;
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

interface CreditApplicationRegisterConsultedData {
  /** The answers as JSON text: the customer identifiers and whether each one is listed, never a name or a birth date. */
  readonly parties: string;
}

interface CreditApplicationAssessedData {
  /** The assessment as JSON text: its inputs, its model version, its score, its band, its factors and the outcome proposed. */
  readonly assessment: string;
  readonly assessorId: string;
}

interface CreditApplicationRequestFoundOutsideProductTermsData {
  readonly productId: string;
  readonly term: string;
  readonly bound: string;
  readonly requested: number;
  readonly limit: number;
}

interface CreditApplicationRequestCheckedWithUnknownProductTermsData {
  readonly productId: string;
}

interface CreditApplicationRefusalReviewedData {
  readonly reviewerId: string;
  readonly conclusion: 'confirm' | 'overturn';
  readonly reason: string;
}

interface CreditApplicationDecidedData {
  readonly outcome: string;
  readonly deciderId: string;
  readonly level: string;
  readonly reasons: string;
  readonly conditions: string;
  readonly approvedAmountCents: number;
  readonly branchId: string;
  readonly exception: boolean;
}

interface CreditApplicationBroughtData {
  readonly brokerId: string;
}

interface CreditApplicationExceptionRequestedData {
  readonly requesterId: string;
  readonly targetLevel: string;
  readonly justification: string;
}

/** How the events of CreditApplication are kept in its stream: one entry per event, read back by `decode`. */
export const creditApplicationEvents: StoredEventTypes<CreditApplicationEvent> = {
  [CreditApplicationSubmitted.eventName]: defineStoredEvent(CreditApplicationSubmitted, {
    version: 3,
    upcasters: {
      // A submission of version 1 recorded no branch: it is read with an empty one, which no version 2 carries.
      1: (data) => ({ ...data, branchId: '' }),
      // A submission of version 2 recorded no product: it is read with an empty one, which no version 3 carries.
      2: (data) => ({ ...data, productId: '' }),
    },
    encode: (event): CreditApplicationSubmittedData => ({
      applicantId: event.applicantId,
      amountInCents: event.amount.cents,
      durationMonths: event.durationMonths,
      branchId: event.branchId,
      productId: event.productId,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationSubmitted(
        aggregateId,
        data.text('applicantId'),
        Money.ofCents(data.number('amountInCents')),
        data.number('durationMonths'),
        occurredAt,
        data.text('branchId'),
        data.text('productId'),
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
  [CreditApplicationRegisterConsulted.eventName]: defineStoredEvent(CreditApplicationRegisterConsulted, {
    version: 1,
    encode: (event): CreditApplicationRegisterConsultedData => ({ parties: JSON.stringify(event.parties) }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationRegisterConsulted(
        aggregateId,
        occurredAt,
        JSON.parse(data.text('parties')) as { customerId: string; listed: boolean }[],
      ),
  }),
  [CreditApplicationAssessed.eventName]: defineStoredEvent(CreditApplicationAssessed, {
    version: 2,
    upcasters: {
      // An assessment of version 1 recorded no assessor: it is read with an empty one, which no version 2 carries.
      1: (data) => ({ ...data, assessorId: '' }),
    },
    encode: (event): CreditApplicationAssessedData => ({
      assessment: JSON.stringify(event.assessment),
      assessorId: event.assessorId,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationAssessed(
        aggregateId,
        occurredAt,
        JSON.parse(data.text('assessment')) as CreditApplicationAssessed['assessment'],
        data.text('assessorId'),
      ),
  }),
  [CreditApplicationRequestFoundOutsideProductTerms.eventName]: defineStoredEvent(
    CreditApplicationRequestFoundOutsideProductTerms,
    {
      version: 1,
      encode: (event): CreditApplicationRequestFoundOutsideProductTermsData => ({
        productId: event.finding.productId,
        term: event.finding.term,
        bound: event.finding.bound,
        requested: event.finding.requested,
        limit: event.finding.limit,
      }),
      decode: (data, { aggregateId, occurredAt }) =>
        new CreditApplicationRequestFoundOutsideProductTerms(aggregateId, occurredAt, {
          kind: 'outside-limit',
          productId: data.text('productId'),
          term: data.text('term') as 'amount' | 'duration',
          bound: data.text('bound') as 'maximum' | 'minimum',
          requested: data.number('requested'),
          limit: data.number('limit'),
        }),
    },
  ),
  [CreditApplicationRequestCheckedWithUnknownProductTerms.eventName]: defineStoredEvent(
    CreditApplicationRequestCheckedWithUnknownProductTerms,
    {
      version: 1,
      encode: (event): CreditApplicationRequestCheckedWithUnknownProductTermsData => ({
        productId: event.productId,
      }),
      decode: (data, { aggregateId, occurredAt }) =>
        new CreditApplicationRequestCheckedWithUnknownProductTerms(aggregateId, occurredAt, data.text('productId')),
    },
  ),
  [CreditApplicationRefusalReviewed.eventName]: defineStoredEvent(CreditApplicationRefusalReviewed, {
    version: 1,
    encode: (event): CreditApplicationRefusalReviewedData => ({
      reviewerId: event.reviewerId,
      conclusion: event.conclusion,
      reason: event.reason,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationRefusalReviewed(
        aggregateId,
        occurredAt,
        data.text('reviewerId'),
        data.text('conclusion') as 'confirm' | 'overturn',
        data.text('reason'),
      ),
  }),
  [CreditApplicationDecided.eventName]: defineStoredEvent(CreditApplicationDecided, {
    version: 2,
    upcasters: {
      // A decision of version 1 recorded no branch and no exception: it is read with an empty branch and no exception.
      1: (data) => ({ ...data, branchId: '', exception: false }),
    },
    encode: (event): CreditApplicationDecidedData => ({
      outcome: event.outcome,
      deciderId: event.deciderId,
      level: event.level,
      reasons: event.reasons,
      conditions: event.conditions,
      approvedAmountCents: event.approvedAmountCents,
      branchId: event.branchId,
      exception: event.exception,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationDecided(
        aggregateId,
        occurredAt,
        data.text('outcome') as DecisionOutcome,
        data.text('deciderId'),
        data.text('level'),
        data.text('reasons'),
        data.text('conditions'),
        data.number('approvedAmountCents'),
        data.text('branchId'),
        data.flag('exception'),
      ),
  }),
  [CreditApplicationBrought.eventName]: defineStoredEvent(CreditApplicationBrought, {
    version: 1,
    encode: (event): CreditApplicationBroughtData => ({ brokerId: event.brokerId }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationBrought(aggregateId, occurredAt, data.text('brokerId')),
  }),
  [CreditApplicationExceptionRequested.eventName]: defineStoredEvent(CreditApplicationExceptionRequested, {
    version: 1,
    encode: (event): CreditApplicationExceptionRequestedData => ({
      requesterId: event.requesterId,
      targetLevel: event.targetLevel,
      justification: event.justification,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationExceptionRequested(
        aggregateId,
        occurredAt,
        data.text('requesterId'),
        data.text('targetLevel'),
        data.text('justification'),
      ),
  }),
};
