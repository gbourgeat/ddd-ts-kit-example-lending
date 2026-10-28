import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { RefusalAlreadyReviewed } from '@/contexts/credit-application/file/domain/errors/refusal-already-reviewed.error';

describe('RefusalAlreadyReviewed', () => {
  it('refuses for application with the code REFUSAL_ALREADY_REVIEWED', () => {
    const error = RefusalAlreadyReviewed.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('REFUSAL_ALREADY_REVIEWED');
    expect(error.message).toBe('The proposed refusal was already reviewed.');
    expect(error.facts).toEqual({});
  });
});
