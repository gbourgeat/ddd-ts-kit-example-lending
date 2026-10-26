import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { AccountDeactivated } from '@/contexts/identity/domain/events/account-deactivated.event';
import { accountDeactivatedV1 } from '@/contexts/identity/published-language/account-deactivated.v1.integration-event';

/** Tells the other contexts, through the outbox, in the transaction of the fact. */
export class AccountDeactivatedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: AccountDeactivated): Promise<void> {
    const published = accountDeactivatedV1.create(
      {
        accountId: event.aggregateId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
