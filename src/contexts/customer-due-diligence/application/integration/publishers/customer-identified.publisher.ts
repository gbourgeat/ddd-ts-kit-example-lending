import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { customerIdentifiedV1 } from '@/contexts/customer-due-diligence/published-language/customer-identified.v1.integration-event';

export class CustomerIdentifiedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CustomerIdentified): Promise<void> {
    const published = customerIdentifiedV1.create(
      {
        customerId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
