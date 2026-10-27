import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The applicant gave the consent to read their bank accounts for this application; it is valid until `expiresAt`. */
export class CreditApplicationAccountConsentGiven extends NamedDomainEvent(
  'credit-application.credit-application.account-consent-given',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly expiresAt: Date,
  ) {
    super();
  }
}
