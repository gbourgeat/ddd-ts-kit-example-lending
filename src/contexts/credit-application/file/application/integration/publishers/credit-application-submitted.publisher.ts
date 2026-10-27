import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { creditApplicationSubmittedV1 } from '@/contexts/credit-application/published-language/credit-application-submitted.v1.integration-event';

export class CreditApplicationSubmittedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CreditApplicationSubmitted): Promise<void> {
    const published = creditApplicationSubmittedV1.create(
      {
        creditApplicationId: event.aggregateId,
        applicantId: event.applicantId,
        requestedAmountCents: event.amount.cents,
        durationMonths: event.durationMonths,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
