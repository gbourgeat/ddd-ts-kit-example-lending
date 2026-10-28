import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';

/**
 * The facts the bank checked to know a person: an identity document valid on the day, and a proof of address.
 * A birth stored before these facts were recorded (version 1) has none: it does not identify the customer.
 */
export interface PersonIdentity {
  readonly documentKind: IdentityDocumentKind;
  readonly documentNumber: string;
  readonly issuingCountry: string;
  readonly documentExpiresOn: Date;
  readonly address: string;
  readonly addressProofDatedOn: Date;
}

/**
 * The name and the birth date the screening checked the person against, kept as the anti-money-laundering
 * record of the identification: personal data, sealed by the customer's subject.
 */
export interface IdentifiedPerson {
  readonly name: string;
  readonly birthDate: Date;
}

export class CustomerIdentified extends NamedDomainEvent('customer-due-diligence.customer.identified') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly identity?: PersonIdentity,
    readonly person?: IdentifiedPerson,
  ) {
    super();
  }
}
