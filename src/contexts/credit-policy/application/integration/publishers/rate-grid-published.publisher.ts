import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';
import { rateGridPublishedV1 } from '@/contexts/credit-policy/published-language/rate-grid-published.v1.integration-event';

export class RateGridPublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: RateGridPublished): Promise<void> {
    const published = rateGridPublishedV1.create(
      {
        rateGridId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
