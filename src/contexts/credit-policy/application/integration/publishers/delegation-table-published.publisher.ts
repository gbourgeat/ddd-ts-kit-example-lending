import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language/delegation-table-published.v2.integration-event';

export class DelegationTablePublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: DelegationTablePublished): Promise<void> {
    const published = delegationTablePublishedV2.create(
      {
        delegationTableId: event.aggregateId,
        effectiveFrom: event.publication.effectiveFrom.toISOString().slice(0, 'YYYY-MM-DD'.length),
        levels: event.publication.levels.map((limit) => ({ level: limit.level, amountCents: limit.amountCents })),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
