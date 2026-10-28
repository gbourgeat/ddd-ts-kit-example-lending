import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { creditApplicationDecidedV1 } from '@/contexts/credit-application/published-language/credit-application-decided.v1.integration-event';

export class CreditApplicationDecidedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CreditApplicationDecided): Promise<void> {
    const published = creditApplicationDecidedV1.create(
      {
        creditApplicationId: event.aggregateId,
        outcome: event.outcome,
        exception: event.exception,
        branchId: event.branchId,
        approvedAmountCents: event.approvedAmountCents,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
