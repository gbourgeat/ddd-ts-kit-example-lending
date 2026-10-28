import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { MissingAccountConsent } from '@/contexts/credit-application/file/domain/errors/missing-account-consent.error';

describe('MissingAccountConsent', () => {
  it('refuses for application with the code MISSING_ACCOUNT_CONSENT', () => {
    const error = MissingAccountConsent.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('MISSING_ACCOUNT_CONSENT');
    expect(error.message).toBe('Missing account consent.');
    expect(error.facts).toEqual({});
  });
});
