import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { DelegationGranted } from '@/contexts/identity/domain/events/delegation-granted.event';
import { delegationGrantedV1 } from '@/contexts/identity/published-language/delegation-granted.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class DelegationGrantedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: DelegationGranted): Promise<void> {
    const published = delegationGrantedV1.create(
      {
        delegationId: event.aggregateId,
        organisationId: event.facts.organisationId,
        delegatorId: event.facts.delegatorId,
        delegateId: event.facts.delegateId,
        rights: [...event.facts.rights],
        startsAt: event.facts.startsAt.toISOString(),
        endsAt: event.facts.endsAt.toISOString(),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.facts.organisationId }]);
  }
}
