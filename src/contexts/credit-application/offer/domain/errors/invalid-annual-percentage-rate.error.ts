import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidAnnualPercentageRate extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidAnnualPercentageRate;

  static forValue(tenths: number) {
    return InvalidAnnualPercentageRate.refusal(
      'An annual percentage rate is a whole number of tenths of a per cent, not negative.',
      { tenths },
    );
  }
}
