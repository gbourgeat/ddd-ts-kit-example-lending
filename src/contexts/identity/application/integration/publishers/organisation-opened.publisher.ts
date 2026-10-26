import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { OrganisationOpened } from '@/contexts/identity/domain/events/organisation-opened.event';
import { organisationOpenedV1 } from '@/contexts/identity/published-language/organisation-opened.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class OrganisationOpenedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: OrganisationOpened): Promise<void> {
    const published = organisationOpenedV1.create(
      {
        organisationId: event.aggregateId,
        name: event.facts.name,
        openedBy: event.facts.openedBy,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    // The organisation is the tenant of the fact: its consumers run in it, whoever acted.
    await this.publisher.publish([{ ...published, tenantId: event.aggregateId }]);
  }
}
