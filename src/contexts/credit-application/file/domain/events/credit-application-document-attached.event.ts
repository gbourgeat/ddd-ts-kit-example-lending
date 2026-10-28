import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CreditApplicationDocumentAttached extends NamedDomainEvent(
  'credit-application.credit-application.document-attached',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly documentKey: string,
    readonly mediaType: string,
    readonly sizeBytes: number,
  ) {
    super();
  }
}
