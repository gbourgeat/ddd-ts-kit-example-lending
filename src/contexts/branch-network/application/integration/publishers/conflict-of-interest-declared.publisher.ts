import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';
import { conflictOfInterestDeclaredV1 } from '@/contexts/branch-network/published-language/conflict-of-interest-declared.v1.integration-event';

export class ConflictOfInterestDeclaredPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: ConflictOfInterestDeclared): Promise<void> {
    const published = conflictOfInterestDeclaredV1.create(
      {
        conflictOfInterestId: event.aggregateId,
        staffMemberId: event.staffMemberId,
        customerId: event.customerId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
