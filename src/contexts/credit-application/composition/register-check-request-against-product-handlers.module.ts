import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';
import { CheckRequestAgainstProductHandler } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.handler';
import { CheckRequestAgainstProductEventHandler } from '@/contexts/credit-application/file/application/event-handlers/check-request-against-product.event-handler';
import type { Platform } from '@/platform/composition/platform';

/** The check of a submitted application against its product: the command, and the reaction to the submission that runs it. */
export function registerCheckRequestAgainstProductHandlers(
  platform: Platform,
  repository: CreditApplicationRepository,
  productTerms: ProductTerms,
): void {
  const check = new CheckRequestAgainstProductHandler(repository, productTerms, platform.clock);

  platform.commands.register(CheckRequestAgainstProductCommand, check, { context: 'credit-application' });

  const checkOnSubmitted = platform.adapter(new CheckRequestAgainstProductEventHandler(check), {
    kind: 'domain-event-handler',
    context: 'credit-application',
  });

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await checkOnSubmitted.handle(event);
    }
  });
}
