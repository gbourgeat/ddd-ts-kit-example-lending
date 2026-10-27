import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { staffMemberAppointedV1 } from '@/contexts/branch-network/published-language/staff-member-appointed.v1.integration-event';

export class StaffMemberAppointedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: StaffMemberAppointed): Promise<void> {
    const published = staffMemberAppointedV1.create(
      {
        staffMemberId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
