import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** The duration is not a positive whole number of months (the product limits are US3). */
export class InvalidDuration extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidDuration;

  static forMonths(months: number) {
    return InvalidDuration.refusal('The duration is not a positive whole number of months.', { months });
  }
}
