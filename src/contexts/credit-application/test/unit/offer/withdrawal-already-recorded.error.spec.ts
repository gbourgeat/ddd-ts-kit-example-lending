import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { WithdrawalAlreadyRecorded } from '@/contexts/credit-application/offer/domain/errors/withdrawal-already-recorded.error';

describe('WithdrawalAlreadyRecorded', () => {
  it('refuses a second withdrawal with the code WITHDRAWAL_ALREADY_RECORDED', () => {
    const error = WithdrawalAlreadyRecorded.forAlreadyWithdrawn('application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('WITHDRAWAL_ALREADY_RECORDED');
  });
});
