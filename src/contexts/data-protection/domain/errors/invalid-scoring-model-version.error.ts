import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { DataProtectionCodes } from '@/contexts/data-protection/data-protection.codes';

/** An impact assessment assesses a named scoring model version: the identifier given is blank. */
export class InvalidScoringModelVersion extends DomainRefusal {
  readonly code = DataProtectionCodes.InvalidScoringModelVersion;

  static forVersion(scoringModelVersion: string) {
    return InvalidScoringModelVersion.refusal('An impact assessment names the scoring model version it assesses.', {
      scoringModelVersion,
    });
  }
}
