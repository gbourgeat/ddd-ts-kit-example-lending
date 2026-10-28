import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { staffMemberAppointedV1 } from '@/contexts/branch-network/published-language/staff-member-appointed.v1.integration-event';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language/staff-member-appointed.v2.integration-event';

/** Publishes the appointment in both versions: version 1 for the consumers not yet moved, version 2 with the level. */
export class StaffMemberAppointedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: StaffMemberAppointed): Promise<void> {
    const staffMemberId = event.aggregateId;
    const v1 = staffMemberAppointedV1.create({ staffMemberId }, { id: this.ids.next(), occurredAt: event.occurredAt });

    const v2 = staffMemberAppointedV2.create(
      { staffMemberId, branchId: event.facts.branchId, level: event.facts.level },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([v1, v2]);
  }
}
