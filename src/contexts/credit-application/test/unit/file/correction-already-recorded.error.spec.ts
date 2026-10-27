import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CorrectionAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/correction-already-recorded.error';

describe('CorrectionAlreadyRecorded', () => {
  it('refuses for the entry with the code CORRECTION_ALREADY_RECORDED', () => {
    const error = CorrectionAlreadyRecorded.forEntry('credit-application-1#2');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CORRECTION_ALREADY_RECORDED');
    expect(error.message).toBe('The entry is already corrected.');
    expect(error.facts).toEqual({ entryId: 'credit-application-1#2' });
  });
});
