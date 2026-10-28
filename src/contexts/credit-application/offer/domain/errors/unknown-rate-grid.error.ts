import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownRateGrid extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownRateGrid;

  static forUnknownRateGrid() {
    return UnknownRateGrid.refusal('Unknown rate grid.');
  }
}
