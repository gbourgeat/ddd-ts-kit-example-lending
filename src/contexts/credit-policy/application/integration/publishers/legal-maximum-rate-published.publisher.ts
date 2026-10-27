import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';
import { legalMaximumRatePublishedV1 } from '@/contexts/credit-policy/published-language/legal-maximum-rate-published.v1.integration-event';

export class LegalMaximumRatePublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LegalMaximumRatePublished): Promise<void> {
    const published = legalMaximumRatePublishedV1.create(
      {
        legalMaximumRateId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
