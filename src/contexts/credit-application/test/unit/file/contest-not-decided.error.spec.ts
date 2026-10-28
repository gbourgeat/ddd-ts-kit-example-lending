import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ContestNotDecided } from '@/contexts/credit-application/file/domain/errors/contest-not-decided.error';

describe('ContestNotDecided', () => {
  it('refuses a contestation of a file not decided with the code CONTEST_NOT_DECIDED', () => {
    const error = ContestNotDecided.forContestNotDecided();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CONTEST_NOT_DECIDED');
    expect(error.facts).toEqual({});
  });
});
