import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** The net income is not a positive amount of cents: a debt to income ratio has no meaning without it. */
export class InvalidNetIncome extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidNetIncome;

  static forCents(cents: number) {
    return InvalidNetIncome.refusal('The net income is not a positive amount of cents.', { cents });
  }
}
