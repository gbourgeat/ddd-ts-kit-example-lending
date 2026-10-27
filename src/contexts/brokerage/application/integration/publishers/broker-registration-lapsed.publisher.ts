import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';
import { brokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language/broker-registration-lapsed.v1.integration-event';

export class BrokerRegistrationLapsedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: BrokerRegistrationLapsed): Promise<void> {
    const published = brokerRegistrationLapsedV1.create(
      {
        brokerId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
