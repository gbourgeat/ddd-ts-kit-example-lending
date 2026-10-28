import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class InvalidRepayment extends DomainRefusal {
  readonly code = ServicingCodes.InvalidRepayment;

  static forAmount(cents: number) {
    return InvalidRepayment.refusal('A repayment is above zero.', { cents });
  }
}
