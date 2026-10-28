import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ContestAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/contest-already-recorded.error';

describe('ContestAlreadyRecorded', () => {
  it('refuses a second contestation with the code CONTEST_ALREADY_RECORDED', () => {
    const error = ContestAlreadyRecorded.forContestAlreadyRecorded();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CONTEST_ALREADY_RECORDED');
    expect(error.facts).toEqual({});
  });
});
