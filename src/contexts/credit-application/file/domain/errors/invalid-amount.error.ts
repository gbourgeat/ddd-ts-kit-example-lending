import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** The requested amount is not a positive whole number of cents (the product limits are US3). */
export class InvalidAmount extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidAmount;

  static forCents(cents: number) {
    return InvalidAmount.refusal('The requested amount is not a positive whole number of cents.', { cents });
  }
}
