import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class BranchOpened extends NamedDomainEvent('branch-network.branch.opened') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
