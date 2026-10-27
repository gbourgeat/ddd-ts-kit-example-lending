import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { ResidualIncomeMinimumPublished } from '@/contexts/credit-policy/domain/events/residual-income-minimum-published.event';
import { residualIncomeMinimumPublishedV1 } from '@/contexts/credit-policy/published-language/residual-income-minimum-published.v1.integration-event';

export class ResidualIncomeMinimumPublishedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: ResidualIncomeMinimumPublished): Promise<void> {
    const published = residualIncomeMinimumPublishedV1.create(
      {
        residualIncomeMinimumId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
