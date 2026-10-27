import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The applicant corrected an earlier entry of the file: this entry names it and says why. */
export class CreditApplicationEntryCorrected extends NamedDomainEvent(
  'credit-application.credit-application.entry-corrected',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly correctedEntryId: string,
    readonly reason: string,
  ) {
    super();
  }
}
