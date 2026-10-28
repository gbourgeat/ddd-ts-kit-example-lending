import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRescheduleDecided } from '@/contexts/credit-application/decision/domain/events/credit-application-reschedule-decided.event';
import { creditApplicationRescheduleDecidedV1 } from '@/contexts/credit-application/published-language/credit-application-reschedule-decided.v1.integration-event';

export class CreditApplicationRescheduleDecidedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CreditApplicationRescheduleDecided): Promise<void> {
    const published = creditApplicationRescheduleDecidedV1.create(
      {
        creditApplicationId: event.aggregateId,
        durationMonths: event.durationMonths,
        outstandingAmountCents: event.outstandingAmountCents,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
