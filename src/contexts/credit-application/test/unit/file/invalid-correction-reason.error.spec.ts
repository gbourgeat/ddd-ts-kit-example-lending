import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidCorrectionReason } from '@/contexts/credit-application/file/domain/errors/invalid-correction-reason.error';

describe('InvalidCorrectionReason', () => {
  it('refuses a correction without a reason with the code INVALID_CORRECTION_REASON', () => {
    const error = InvalidCorrectionReason.forReason();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_CORRECTION_REASON');
    expect(error.message).toBe('A correction must say why it corrects the entry.');
  });
});
