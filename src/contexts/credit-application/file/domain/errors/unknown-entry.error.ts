import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownEntry extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownEntry;

  static forEntry(entryId: string) {
    return UnknownEntry.refusal('Unknown entry of this application.', { entryId });
  }
}
