import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { CheckRequestAgainstProductHandler } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.handler';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';

/** When an application is submitted, it is checked against its product, in the transaction of the submission. */
export class CheckRequestAgainstProductEventHandler {
  constructor(private readonly check: CheckRequestAgainstProductHandler) {}

  async handle(event: CreditApplicationSubmitted): Promise<void> {
    await this.check.execute(new CheckRequestAgainstProductCommand(event.aggregateId));
  }
}
