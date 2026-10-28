import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';

export class UnknownModelVersion extends DomainRefusal {
  readonly code = CreditScoringCodes.UnknownModelVersion;

  static forLabel(label: string) {
    return UnknownModelVersion.refusal('No published version of the scoring model has this label.', { label });
  }
}
