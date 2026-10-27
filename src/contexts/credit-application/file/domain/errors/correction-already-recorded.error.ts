import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class CorrectionAlreadyRecorded extends DomainRefusal {
  readonly code = CreditApplicationCodes.CorrectionAlreadyRecorded;

  static forEntry(entryId: string) {
    return CorrectionAlreadyRecorded.refusal('The entry is already corrected.', { entryId });
  }
}
