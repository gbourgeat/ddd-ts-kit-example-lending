import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { MissingAccountInformation } from '@/contexts/credit-application/assessment/domain/errors/missing-account-information.error';

describe('MissingAccountInformation', () => {
  it('refuses the assessment of an application whose account information is not read, by its code', () => {
    const error = MissingAccountInformation.forApplication('credit-application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('MISSING_ACCOUNT_INFORMATION');
  });
});
