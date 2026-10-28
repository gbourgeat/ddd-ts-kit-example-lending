import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ReschedulingNotApproved } from '@/contexts/credit-application/decision/domain/errors/rescheduling-not-approved.error';

describe('ReschedulingNotApproved', () => {
  it('refuses a rescheduling of an application with the code RESCHEDULING_NOT_APPROVED', () => {
    const error = ReschedulingNotApproved.forApplication('credit-application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('RESCHEDULING_NOT_APPROVED');
    expect(error.facts).toEqual({ applicationId: 'credit-application-1' });
  });
});
