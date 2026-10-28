import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class MissingReason extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.MissingReason;

  static forDismissal(customerId: string) {
    return MissingReason.refusal(
      'A possible match is dismissed only with the reason of the compliance officer: the reason is blank.',
      { customerId },
    );
  }
}
