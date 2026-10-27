import type { CustomerFileProjection } from '@/contexts/customer-due-diligence/application/ports/customer-file-projection.port';
import type { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

/** When a customer is identified, its file starts to be read: the row is written in the transaction of the identification. */
export class CustomerFileOnIdentifiedEventHandler {
  constructor(private readonly projection: CustomerFileProjection) {}

  async handle(event: CustomerIdentified): Promise<void> {
    await this.projection.recordIdentified(event.aggregateId, event.occurredAt);
  }
}
