import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { DelegationRevoked } from '@/contexts/identity/domain/events/delegation-revoked.event';
import { delegationRevokedV1 } from '@/contexts/identity/published-language/delegation-revoked.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class DelegationRevokedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: DelegationRevoked): Promise<void> {
    const published = delegationRevokedV1.create(
      {
        delegationId: event.aggregateId,
        organisationId: event.facts.organisationId,
        delegatorId: event.facts.delegatorId,
        delegateId: event.facts.delegateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.facts.organisationId }]);
  }
}
