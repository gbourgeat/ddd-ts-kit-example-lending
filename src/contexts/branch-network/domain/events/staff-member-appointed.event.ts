import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class StaffMemberAppointed extends NamedDomainEvent('branch-network.staff-member.appointed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
