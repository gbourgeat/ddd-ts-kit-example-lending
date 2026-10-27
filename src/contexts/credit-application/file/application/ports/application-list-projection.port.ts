import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

/** Writes the application list read model: one row per submitted application, written in the transaction of the submission. */
export abstract class ApplicationListProjection {
  abstract recordSubmitted(event: CreditApplicationSubmitted): Promise<void>;
}
