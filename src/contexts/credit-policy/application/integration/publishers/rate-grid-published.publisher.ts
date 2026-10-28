import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language/rate-grid-published.v2.integration-event';

export class RateGridPublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: RateGridPublished): Promise<void> {
    const published = rateGridPublishedV2.create(
      {
        rateGridId: event.aggregateId,
        productId: event.publication.productId,
        effectiveFrom: event.publication.effectiveFrom.toISOString().slice(0, 'YYYY-MM-DD'.length),
        rates: event.publication.rates.map((band) => ({ ...band })),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
