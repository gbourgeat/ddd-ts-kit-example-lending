import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class ScoringModelPublished extends NamedDomainEvent('credit-scoring.scoring-model.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    // TODO(domain): add as readonly parameters the facts a reaction needs to know about "scoring model published" (value objects or primitives, never the aggregate itself).
  ) {
    super();
  }
}
