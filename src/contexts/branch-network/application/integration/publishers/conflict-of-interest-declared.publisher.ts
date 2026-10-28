import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';
import { UnknownStaffMember } from '@/contexts/branch-network/domain/errors/unknown-staff-member.error';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';
import { conflictOfInterestDeclaredV1 } from '@/contexts/branch-network/published-language/conflict-of-interest-declared.v1.integration-event';

export class ConflictOfInterestDeclaredPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
    private readonly staffMembers: StaffMemberRepository,
  ) {}

  /** The announcement names the account of the staff member too: it is the actor of what they prepare or decide. */
  async handle(event: ConflictOfInterestDeclared): Promise<void> {
    const staffMember = await this.staffMembers.findById(event.staffMemberId);

    if (staffMember === undefined) {
      throw UnknownStaffMember.forStaffMember(event.staffMemberId);
    }

    const published = conflictOfInterestDeclaredV1.create(
      {
        conflictOfInterestId: event.aggregateId,
        staffMemberId: event.staffMemberId,
        customerId: event.customerId,
        accountId: staffMember.accountId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
