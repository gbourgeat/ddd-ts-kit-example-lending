import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';
import { delegationTablePublishedV1 } from '@/contexts/credit-policy/published-language/delegation-table-published.v1.integration-event';

export class DelegationTablePublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: DelegationTablePublished): Promise<void> {
    const published = delegationTablePublishedV1.create(
      {
        delegationTableId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
