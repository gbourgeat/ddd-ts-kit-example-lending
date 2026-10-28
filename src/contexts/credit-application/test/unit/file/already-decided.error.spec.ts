import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { AlreadyDecided } from '@/contexts/credit-application/file/domain/errors/already-decided.error';

describe('AlreadyDecided', () => {
  it('refuses a second decision with the code ALREADY_DECIDED', () => {
    const error = AlreadyDecided.forAlreadyDecided();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('ALREADY_DECIDED');
    expect(error.message).toBe('The application was already decided: a decision is recorded once.');
    expect(error.facts).toEqual({});
  });
});
