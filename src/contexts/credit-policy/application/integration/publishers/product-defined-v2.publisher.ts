import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language/product-defined.v2.integration-event';

export class ProductDefinedV2Publisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: ProductDefined): Promise<void> {
    const published = productDefinedV2.create(
      {
        productId: event.aggregateId,
        ...event.terms,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
