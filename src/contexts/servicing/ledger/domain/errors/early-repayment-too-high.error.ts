import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class EarlyRepaymentTooHigh extends DomainRefusal {
  readonly code = ServicingCodes.EarlyRepaymentTooHigh;

  static forRepayment(capitalCents: number, outstandingCents: number) {
    return EarlyRepaymentTooHigh.refusal('The repayment is above the outstanding capital of the loan.', {
      capitalCents,
      outstandingCents,
    });
  }
}
