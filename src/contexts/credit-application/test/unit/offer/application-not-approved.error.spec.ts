import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ApplicationNotApproved } from '@/contexts/credit-application/offer/domain/errors/application-not-approved.error';

describe('ApplicationNotApproved', () => {
  it('refuses for application with the code APPLICATION_NOT_APPROVED, naming the application', () => {
    const error = ApplicationNotApproved.forApplication('application-3');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('APPLICATION_NOT_APPROVED');
    expect(error.facts).toEqual({ applicationId: 'application-3' });
  });
});
