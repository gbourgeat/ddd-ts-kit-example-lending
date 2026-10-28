import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language/legal-maximum-rate-published.v2.integration-event';

export class LegalMaximumRatePublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LegalMaximumRatePublished): Promise<void> {
    const published = legalMaximumRatePublishedV2.create(
      {
        legalMaximumRateId: event.aggregateId,
        category: event.publication.category,
        rateBasisPoints: event.publication.rateBasisPoints,
        effectiveFrom: event.publication.effectiveFrom.toISOString().slice(0, 'YYYY-MM-DD'.length),
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
