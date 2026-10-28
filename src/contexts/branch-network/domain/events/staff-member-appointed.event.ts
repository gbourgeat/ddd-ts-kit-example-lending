import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** A member of staff was appointed to a branch, at a level. */
export class StaffMemberAppointed extends NamedDomainEvent('branch-network.staff-member.appointed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly facts: {
      readonly branchId: string;
      readonly level: string;
      /** The account the staff member signs in with: the actor of what they decide. */
      readonly accountId: string;
    },
  ) {
    super();
  }
}
