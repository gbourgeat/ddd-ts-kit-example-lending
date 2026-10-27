import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';
import { productDefinedV1 } from '@/contexts/credit-policy/published-language/product-defined.v1.integration-event';

export class ProductDefinedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: ProductDefined): Promise<void> {
    const published = productDefinedV1.create(
      {
        productId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
