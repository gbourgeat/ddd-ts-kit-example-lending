import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class InvalidSchedule extends DomainRefusal {
  readonly code = ServicingCodes.InvalidSchedule;

  static forInvalidTerms(rule: string, value: number) {
    return InvalidSchedule.refusal(
      'The terms of the schedule are invalid: the amount, the rate or the number of months is out of its rule.',
      {
        rule,
        value,
      },
    );
  }
}
