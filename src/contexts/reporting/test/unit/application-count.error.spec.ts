import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ApplicationCount } from '@/contexts/reporting/domain/errors/application-count.error';

describe('ApplicationCount', () => {
  it('refuses for submission without tenant with the code APPLICATION_COUNT', () => {
    const error = ApplicationCount.forSubmissionWithoutTenant('credit-application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('APPLICATION_COUNT');
    expect(error.message).toBe('A submission without its tenant cannot be counted.');
    expect(error.facts).toEqual({ creditApplicationId: 'credit-application-1' });
  });
});
