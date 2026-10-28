import type { StoredEventData } from '@ddd-ts-kit/kernel';
import { defineStoredEvent, personalData, type PersonalValue, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import type { CustomerEvent } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';
import { CustomerPossibleMatchFound } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-found.event';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { CustomerRelationshipEnded } from '@/contexts/customer-due-diligence/domain/events/customer-relationship-ended.event';
import { CustomerPossibleMatchDismissed } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-dismissed.event';

interface CustomerBusinessRegisteredData {
  readonly legalName: string;
  readonly registrationNumber: string;
  readonly countryOfRegistration: string;
  readonly registeredOn: string;
}

interface CustomerDirectorsAndOwnersDeclaredData {
  readonly directors: PersonIdentityData[];
  readonly beneficialOwners: PersonIdentityData[];
}

interface CustomerAdvisorAssignedData {
  readonly advisorId: string;
}

type CustomerPossibleMatchFoundData = Record<string, never>;

type CustomerSanctionsMatchConfirmedData = Record<string, never>;

type CustomerRelationshipEndedData = Record<string, never>;

interface CustomerPossibleMatchDismissedData {
  readonly reason: string;
}

/** The identity facts of version 2 of the birth; the document number and the address are personal, sealed by subject. */
interface PersonIdentityData {
  readonly documentKind: string;
  readonly documentNumber: PersonalValue;
  readonly issuingCountry: string;
  readonly documentExpiresOn: string;
  readonly address: PersonalValue;
  readonly addressProofDatedOn: string;
}

/** Version 2 of the birth: `identityRecorded` is false for a birth upcast from version 1, which has no identity. */
interface CustomerIdentifiedData {
  readonly identityRecorded: boolean;
  readonly identity: PersonIdentityData | null;
}

/** How the events of Customer are kept in its stream: one entry per event, read back by `decode`. */
export const customerEvents: StoredEventTypes<CustomerEvent> = {
  [CustomerIdentified.eventName]: defineStoredEvent(CustomerIdentified, {
    version: 2,
    upcasters: {
      // A birth of version 1 recorded no identity fact: it is read as not recorded, and identifies no one.
      1: () => ({ identityRecorded: false, identity: null }),
    },
    encode: (event): CustomerIdentifiedData => ({
      identityRecorded: event.identity !== undefined,
      identity: event.identity === undefined ? null : identityDataOf(event.aggregateId, event.identity),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CustomerIdentified(
        aggregateId,
        occurredAt,
        data.flag('identityRecorded') ? identityOf(data.record('identity')) : undefined,
      ),
  }),
  [CustomerBusinessRegistered.eventName]: defineStoredEvent(CustomerBusinessRegistered, {
    version: 1,
    encode: (event): CustomerBusinessRegisteredData => ({
      legalName: event.legalName,
      registrationNumber: event.registrationNumber,
      countryOfRegistration: event.countryOfRegistration,
      registeredOn: event.registeredOn.toISOString(),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CustomerBusinessRegistered(
        aggregateId,
        occurredAt,
        data.text('legalName'),
        data.text('registrationNumber'),
        data.text('countryOfRegistration'),
        data.instant('registeredOn'),
      ),
  }),
  [CustomerDirectorsAndOwnersDeclared.eventName]: defineStoredEvent(CustomerDirectorsAndOwnersDeclared, {
    version: 1,
    encode: (event): CustomerDirectorsAndOwnersDeclaredData => ({
      directors: event.directors.map((person) => identityDataOf(event.aggregateId, person)),
      beneficialOwners: event.beneficialOwners.map((person) => identityDataOf(event.aggregateId, person)),
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CustomerDirectorsAndOwnersDeclared(
        aggregateId,
        occurredAt,
        data.records('directors').map((person) => identityOf(person)),
        data.records('beneficialOwners').map((person) => identityOf(person)),
      ),
  }),
  [CustomerAdvisorAssigned.eventName]: defineStoredEvent(CustomerAdvisorAssigned, {
    version: 1,
    encode: (event): CustomerAdvisorAssignedData => ({ advisorId: event.advisorId }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CustomerAdvisorAssigned(aggregateId, occurredAt, data.text('advisorId')),
  }),
  [CustomerPossibleMatchFound.eventName]: defineStoredEvent(CustomerPossibleMatchFound, {
    version: 1,
    encode: (): CustomerPossibleMatchFoundData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new CustomerPossibleMatchFound(aggregateId, occurredAt),
  }),
  [CustomerSanctionsMatchConfirmed.eventName]: defineStoredEvent(CustomerSanctionsMatchConfirmed, {
    version: 1,
    encode: (): CustomerSanctionsMatchConfirmedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new CustomerSanctionsMatchConfirmed(aggregateId, occurredAt),
  }),
  [CustomerRelationshipEnded.eventName]: defineStoredEvent(CustomerRelationshipEnded, {
    version: 1,
    encode: (): CustomerRelationshipEndedData => ({}),
    decode: (_data, { aggregateId, occurredAt }) => new CustomerRelationshipEnded(aggregateId, occurredAt),
  }),
  [CustomerPossibleMatchDismissed.eventName]: defineStoredEvent(CustomerPossibleMatchDismissed, {
    version: 1,
    encode: (event): CustomerPossibleMatchDismissedData => ({ reason: event.reason }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CustomerPossibleMatchDismissed(aggregateId, occurredAt, data.text('reason')),
  }),
};

type PersonIdentity = NonNullable<CustomerIdentified['identity']>;

function identityDataOf(subject: string, identity: PersonIdentity): PersonIdentityData {
  return {
    documentKind: identity.documentKind,
    documentNumber: personalData(subject, identity.documentNumber),
    issuingCountry: identity.issuingCountry,
    documentExpiresOn: identity.documentExpiresOn.toISOString(),
    address: personalData(subject, identity.address),
    addressProofDatedOn: identity.addressProofDatedOn.toISOString(),
  };
}

function identityOf(data: StoredEventData): PersonIdentity {
  return {
    documentKind: documentKindOf(data.text('documentKind')),
    documentNumber: data.text('documentNumber'),
    issuingCountry: data.text('issuingCountry'),
    documentExpiresOn: data.instant('documentExpiresOn'),
    address: data.text('address'),
    addressProofDatedOn: data.instant('addressProofDatedOn'),
  };
}

/** The kinds of identity document the stream may hold: a stored kind outside this list is a corrupted stream. */
function documentKindOf(raw: string): IdentityDocumentKind {
  const kind = Object.values(IdentityDocumentKind).find((known) => known === raw);

  if (kind === undefined) {
    throw new Error(`Unknown identity document kind in the stream: ${raw}`);
  }

  return kind;
}
