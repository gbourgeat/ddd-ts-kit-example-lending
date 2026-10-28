import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class PreparerCannotDecide extends DomainRefusal {
  readonly code = CreditApplicationCodes.PreparerCannotDecide;

  static forPreparerCannotDecide() {
    return PreparerCannotDecide.refusal('The person who prepared the application never decides it.');
  }
}
