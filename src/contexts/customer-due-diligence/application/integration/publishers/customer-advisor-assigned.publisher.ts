import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';
import { customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language/customer-advisor-assigned.v1.integration-event';

export class CustomerAdvisorAssignedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
  ) {}

  async handle(event: CustomerAdvisorAssigned): Promise<void> {
    const published = customerAdvisorAssignedV1.create(
      {
        customerId: event.aggregateId,
        advisorId: event.advisorId,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
