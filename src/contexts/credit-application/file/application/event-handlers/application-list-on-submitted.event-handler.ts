import type { ApplicationListProjection } from '@/contexts/credit-application/file/application/ports/application-list-projection.port';
import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

/** When an application is submitted, it joins the list: the row is written in the transaction of the submission. */
export class ApplicationListOnSubmittedEventHandler {
  constructor(private readonly projection: ApplicationListProjection) {}

  async handle(event: CreditApplicationSubmitted): Promise<void> {
    await this.projection.recordSubmitted(event);
  }
}
