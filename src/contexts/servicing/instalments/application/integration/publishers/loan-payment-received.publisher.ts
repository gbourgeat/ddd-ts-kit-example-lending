import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { loanPaymentReceivedV1 } from '@/contexts/servicing/published-language/loan-payment-received.v1.integration-event';

export class LoanPaymentReceivedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LoanPaymentReceived): Promise<void> {
    const published = loanPaymentReceivedV1.create(
      {
        loanId: event.aggregateId,
        instalmentNumber: event.number,
        amountCents: event.amount.cents,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
