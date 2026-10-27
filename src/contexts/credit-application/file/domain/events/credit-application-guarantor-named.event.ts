import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The applicant named a person as the guarantor of the application: that person backs the debt if the borrower does not pay. */
export class CreditApplicationGuarantorNamed extends NamedDomainEvent(
  'credit-application.credit-application.guarantor-named',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly guarantorId: string,
  ) {
    super();
  }
}
