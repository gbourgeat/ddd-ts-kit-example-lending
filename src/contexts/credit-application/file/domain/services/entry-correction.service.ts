import { InvalidCorrectionReason } from '@/contexts/credit-application/file/domain/errors/invalid-correction-reason.error';
import { CorrectionAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/correction-already-recorded.error';
import { UnknownEntry } from '@/contexts/credit-application/file/domain/errors/unknown-entry.error';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';

/**
 * The check of a correction of an entry of the file: the reason is given, the entry is one of this file, and it is not
 * corrected already. It gives the correction as the later entry of the file, which names the entry it corrects.
 */
export class EntryCorrectionService {
  eventOf(
    aggregateId: string,
    file: { readonly entryCount: number; readonly correctedEntryIds: readonly string[] },
    correction: { readonly correctedEntryId: string; readonly reason: string; readonly correctedAt: Date },
  ): CreditApplicationEntryCorrected {
    if (correction.reason.trim() === '') {
      throw InvalidCorrectionReason.forReason();
    }

    if (!this.isEntryOfThisFile(aggregateId, file.entryCount, correction.correctedEntryId)) {
      throw UnknownEntry.forEntry(correction.correctedEntryId);
    }

    if (file.correctedEntryIds.includes(correction.correctedEntryId)) {
      throw CorrectionAlreadyRecorded.forEntry(correction.correctedEntryId);
    }

    return new CreditApplicationEntryCorrected(
      aggregateId,
      correction.correctedAt,
      correction.correctedEntryId,
      correction.reason,
    );
  }

  /** An entry is identified by the application it belongs to and its position in the file: `<application>#<position>`. */
  private isEntryOfThisFile(aggregateId: string, entryCount: number, entryId: string): boolean {
    const separator = entryId.lastIndexOf('#');

    if (separator <= 0) {
      return false;
    }

    const position = Number(entryId.slice(separator + 1));

    return (
      entryId.slice(0, separator) === aggregateId &&
      Number.isSafeInteger(position) &&
      position >= 1 &&
      position <= entryCount
    );
  }
}
