import { describe, expect, it } from '@jest/globals';
import { EntryCorrectionService } from '@/contexts/credit-application/file/domain/services/entry-correction.service';
import { expectRefusal } from '@ddd-ts-kit/testing';

const correctedAt = new Date('2026-03-01T10:00:00.000Z');
const file = { entryCount: 3, correctedEntryIds: [] as readonly string[] };

describe('EntryCorrectionService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new EntryCorrectionService())).toEqual([]);
  });

  it('records a correction of an entry of the file, with the reason given', () => {
    const event = new EntryCorrectionService().eventOf('app-1', file, {
      correctedEntryId: 'app-1#2',
      reason: 'wrong amount',
      correctedAt,
    });

    expect(event).toMatchObject({ aggregateId: 'app-1', correctedEntryId: 'app-1#2', reason: 'wrong amount' });
  });

  it('refuses a correction without a written reason, by its code', () => {
    expectRefusal(
      () =>
        new EntryCorrectionService().eventOf('app-1', file, { correctedEntryId: 'app-1#2', reason: ' ', correctedAt }),
      'INVALID_CORRECTION_REASON',
    );
  });

  it('refuses a correction of an entry that is not one of this file, by its code', () => {
    expectRefusal(
      () =>
        new EntryCorrectionService().eventOf('app-1', file, {
          correctedEntryId: 'app-2#1',
          reason: 'why',
          correctedAt,
        }),
      'UNKNOWN_ENTRY',
    );
  });

  it('refuses a second correction of the same entry, by its code', () => {
    const corrected = { entryCount: 3, correctedEntryIds: ['app-1#2'] };

    expectRefusal(
      () =>
        new EntryCorrectionService().eventOf('app-1', corrected, {
          correctedEntryId: 'app-1#2',
          reason: 'again',
          correctedAt,
        }),
      'CORRECTION_ALREADY_RECORDED',
    );
  });
});
