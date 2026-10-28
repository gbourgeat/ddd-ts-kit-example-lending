import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { loanPaidOutV1 } from '@/contexts/servicing/published-language/loan-paid-out.v1.integration-event';

export class LoanPaidOutPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: LoanPaidOut): Promise<void> {
    const published = loanPaidOutV1.create(
      {
        loanId: event.aggregateId,
        // TODO(domain): map each fact of the domain event to its field of the public payload, as primitives; leave out what other contexts must not depend on.
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
