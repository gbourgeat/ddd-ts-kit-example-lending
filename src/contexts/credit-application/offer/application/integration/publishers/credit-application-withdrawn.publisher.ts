import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CreditApplicationWithdrawn } from '@/contexts/credit-application/offer/domain/events/credit-application-withdrawn.event';
import { creditApplicationWithdrawnV1 } from '@/contexts/credit-application/published-language/credit-application-withdrawn.v1.integration-event';

export class CreditApplicationWithdrawnPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CreditApplicationWithdrawn): Promise<void> {
    const published = creditApplicationWithdrawnV1.create(
      {
        creditApplicationId: event.aggregateId,
        // TODO(domain): map each fact of the domain event to its field of the public payload, as primitives; leave out what other contexts must not depend on.
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
