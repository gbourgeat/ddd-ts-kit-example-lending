import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { DataProtectionCodes } from '@/contexts/data-protection/data-protection.codes';

/** The copy asked for is not kept: it was never made for this data subject, or its seven days are over and it is deleted. */
export class UnknownPersonalDataCopy extends DomainRefusal {
  readonly code = DataProtectionCodes.UnknownPersonalDataCopy;

  static forUnknownPersonalDataCopy() {
    return UnknownPersonalDataCopy.refusal(
      'No copy of data is kept under this identifier: a copy is kept seven days, then deleted.',
    );
  }
}
