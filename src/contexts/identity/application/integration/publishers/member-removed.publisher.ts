import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { MemberRemoved } from '@/contexts/identity/domain/events/member-removed.event';
import { memberRemovedV1 } from '@/contexts/identity/published-language/member-removed.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class MemberRemovedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: MemberRemoved): Promise<void> {
    const published = memberRemovedV1.create(
      {
        memberId: event.aggregateId,
        organisationId: event.facts.organisationId,
        accountId: event.facts.accountId,
        ...(event.facts.delegationId === undefined ? {} : { delegationId: event.facts.delegationId }),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.facts.organisationId }]);
  }
}
