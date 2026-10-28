import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoAdvisorBranch } from '@/contexts/credit-application/file/domain/errors/no-advisor-branch.error';

describe('NoAdvisorBranch', () => {
  it('refuses an applicant no advisor holds, with the code NO_ADVISOR_BRANCH and the applicant as its fact', () => {
    const error = NoAdvisorBranch.forApplicant('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_ADVISOR_BRANCH');
    expect(error.facts).toEqual({ applicantId: 'customer-1' });
  });
});
