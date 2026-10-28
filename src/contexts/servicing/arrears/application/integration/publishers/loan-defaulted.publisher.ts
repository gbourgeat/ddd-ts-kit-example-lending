import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import { loanDefaultedV1 } from '@/contexts/servicing/published-language/loan-defaulted.v1.integration-event';

export class LoanDefaultedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LoanDefaulted): Promise<void> {
    const published = loanDefaultedV1.create(
      {
        loanId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
