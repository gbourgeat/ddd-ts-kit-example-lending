import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class DelegationTablePublished extends NamedDomainEvent('credit-policy.delegation-table.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
