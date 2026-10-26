import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { MemberJoined } from '@/contexts/identity/domain/events/member-joined.event';
import { memberJoinedV1 } from '@/contexts/identity/published-language/member-joined.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class MemberJoinedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: MemberJoined): Promise<void> {
    const published = memberJoinedV1.create(
      {
        memberId: event.aggregateId,
        organisationId: event.facts.organisationId,
        accountId: event.facts.accountId,
        role: event.facts.role,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.facts.organisationId }]);
  }
}
