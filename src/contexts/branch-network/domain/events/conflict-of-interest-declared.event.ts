import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class ConflictOfInterestDeclared extends NamedDomainEvent('branch-network.conflict-of-interest.declared') {
  constructor(
    readonly aggregateId: string,
    readonly staffMemberId: string,
    readonly customerId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
