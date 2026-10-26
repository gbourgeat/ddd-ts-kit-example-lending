import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { MemberRoleChanged } from '@/contexts/identity/domain/events/member-role-changed.event';
import { memberRoleChangedV1 } from '@/contexts/identity/published-language/member-role-changed.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class MemberRoleChangedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: MemberRoleChanged): Promise<void> {
    const published = memberRoleChangedV1.create(
      {
        memberId: event.aggregateId,
        organisationId: event.facts.organisationId,
        accountId: event.facts.accountId,
        from: event.facts.from,
        to: event.facts.to,
        ...(event.facts.delegationId === undefined ? {} : { delegationId: event.facts.delegationId }),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.facts.organisationId }]);
  }
}
