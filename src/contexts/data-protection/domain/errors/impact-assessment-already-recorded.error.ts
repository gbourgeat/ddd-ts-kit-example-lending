import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { DataProtectionCodes } from '@/contexts/data-protection/data-protection.codes';

/** One impact assessment per scoring model version and per month: the first one recorded is kept, never amended. */
export class ImpactAssessmentAlreadyRecorded extends DomainRefusal {
  readonly code = DataProtectionCodes.ImpactAssessmentAlreadyRecorded;

  static forVersionAndMonth(scoringModelVersion: string, month: string) {
    return ImpactAssessmentAlreadyRecorded.refusal(
      'An impact assessment of this scoring model version is already recorded for this month.',
      { scoringModelVersion, month },
    );
  }
}
