import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { loanArrearsBucketEnteredV1 } from '@/contexts/servicing/published-language/loan-arrears-bucket-entered.v1.integration-event';

export class LoanArrearsBucketEnteredPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LoanArrearsBucketEntered): Promise<void> {
    const published = loanArrearsBucketEnteredV1.create(
      {
        loanId: event.aggregateId,
        bucket: event.bucket,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
