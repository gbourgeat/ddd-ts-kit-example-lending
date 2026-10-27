import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class InvalidLegalMaximumRate extends DomainRefusal {
  readonly code = CreditPolicyCodes.InvalidLegalMaximumRate;

  static forBasisPoints(basisPoints: number) {
    return InvalidLegalMaximumRate.refusal(
      'A legal maximum rate is a whole number of basis points of a year, from 0.',
      {
        basisPoints,
      },
    ).exposing('basisPoints');
  }

  static forCategory(category: string) {
    return InvalidLegalMaximumRate.refusal('A legal maximum rate is set for a personal, car or term loan.', {
      category,
    }).exposing('category');
  }

  static forBeforeLatest(effectiveFrom: Date, latestEffectiveFrom: Date) {
    return InvalidLegalMaximumRate.refusal(
      'A legal maximum rate cannot take effect before the latest rate of its category.',
      { effectiveFrom, latestEffectiveFrom },
    ).exposing('effectiveFrom', 'latestEffectiveFrom');
  }
}
