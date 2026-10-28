import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownProductTerms extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownProductTerms;

  static forUnknownProductTerms() {
    return UnknownProductTerms.refusal('Unknown product terms.');
  }
}
