import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';

/** A person reviewed the refusal the last assessment proposed: the reviewer, the conclusion and the written reason are kept. */
export class CreditApplicationRefusalReviewed extends NamedDomainEvent(
  'credit-application.credit-application.refusal-reviewed',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly reviewerId: string,
    readonly conclusion: RefusalConclusion,
    readonly reason: string,
  ) {
    super();
  }
}
