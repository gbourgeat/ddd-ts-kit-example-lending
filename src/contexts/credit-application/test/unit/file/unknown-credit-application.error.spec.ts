import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

describe('UnknownCreditApplication', () => {
  it('refuses for credit application with the code UNKNOWN_CREDIT_APPLICATION', () => {
    const error = UnknownCreditApplication.forCreditApplication('credit-application-404');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_CREDIT_APPLICATION');
    expect(error.message).toBe('Unknown credit application.');
    expect(error.facts).toEqual({ id: 'credit-application-404' });
  });
});
