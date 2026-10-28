import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidApplicantInput } from '@/contexts/credit-scoring/domain/errors/invalid-applicant-input.error';

describe('InvalidApplicantInput', () => {
  it('refuses an applicant input with the code INVALID_APPLICANT_INPUT', () => {
    const error = InvalidApplicantInput.forInput('repaymentIncidents', -1);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_APPLICANT_INPUT');
  });
});
