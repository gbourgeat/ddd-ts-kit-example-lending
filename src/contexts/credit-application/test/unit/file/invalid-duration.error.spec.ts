import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidDuration } from '@/contexts/credit-application/file/domain/errors/invalid-duration.error';

describe('InvalidDuration', () => {
  it('refuses for months with the code INVALID_DURATION', () => {
    const error = InvalidDuration.forMonths(0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_DURATION');
    expect(error.message).toBe('The duration is not a positive whole number of months.');
  });
});
