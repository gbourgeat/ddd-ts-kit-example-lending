import { CreditApplicationSubmittedPublisher } from '@/contexts/credit-application/file/application/integration/publishers/credit-application-submitted.publisher';
import { ApplicationListOnSubmittedEventHandler } from '@/contexts/credit-application/file/application/event-handlers/application-list-on-submitted.event-handler';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { ApplicationListProjection } from '@/contexts/credit-application/file/application/ports/application-list-projection.port';
import type { Platform } from '@/platform/composition/platform';

/** What the context does when an application is submitted: it is announced to the other contexts and listed. */
export function registerSubmissionReactions(platform: Platform, applicationList: ApplicationListProjection): void {
  const creditApplicationSubmittedPublisher = platform.adapter(
    new CreditApplicationSubmittedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'credit-application' },
  );

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await creditApplicationSubmittedPublisher.handle(event);
    }
  });

  const applicationListOnSubmittedEventHandler = platform.adapter(
    new ApplicationListOnSubmittedEventHandler(applicationList),
    { kind: 'domain-event-handler', context: 'credit-application' },
  );

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await applicationListOnSubmittedEventHandler.handle(event);
    }
  });
}
