import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NotAssessed } from '@/contexts/credit-application/file/domain/errors/not-assessed.error';

describe('NotAssessed', () => {
  it('refuses a decision on an application not assessed, with the code NOT_ASSESSED', () => {
    const error = NotAssessed.forNotAssessed();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NOT_ASSESSED');
    expect(error.message).toBe('The application was not assessed: it cannot be decided before its assessment.');
    expect(error.facts).toEqual({});
  });
});
