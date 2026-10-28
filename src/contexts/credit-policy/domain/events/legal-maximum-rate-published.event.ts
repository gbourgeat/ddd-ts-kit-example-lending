import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class LegalMaximumRatePublished extends NamedDomainEvent('credit-policy.legal-maximum-rate.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly publication: {
      readonly category: string;
      readonly rateBasisPoints: number;
      readonly effectiveFrom: Date;
    },
  ) {
    super();
  }
}
