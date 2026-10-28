import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class InvalidBorrower extends DomainRefusal {
  readonly code = ServicingCodes.InvalidBorrower;

  static forName() {
    return InvalidBorrower.refusal('The borrower of a loan must have a name.');
  }
}
