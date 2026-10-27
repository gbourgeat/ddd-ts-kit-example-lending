import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';
import { brokerRegisteredV1 } from '@/contexts/brokerage/published-language/broker-registered.v1.integration-event';

export class BrokerRegisteredPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: BrokerRegistered): Promise<void> {
    const published = brokerRegisteredV1.create(
      {
        brokerId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
