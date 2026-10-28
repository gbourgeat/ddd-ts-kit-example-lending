import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidExceptionJustification extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidExceptionJustification;

  static forInvalidExceptionJustification() {
    return InvalidExceptionJustification.refusal(
      'An exception needs its justification in words: the level above decides on the reasons given.',
    );
  }
}
