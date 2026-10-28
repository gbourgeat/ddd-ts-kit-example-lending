import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { RefusalNotReviewed } from '@/contexts/credit-application/file/domain/errors/refusal-not-reviewed.error';

describe('RefusalNotReviewed', () => {
  it('refuses a decision over a proposed refusal not reviewed, with the code REFUSAL_NOT_REVIEWED', () => {
    const error = RefusalNotReviewed.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('REFUSAL_NOT_REVIEWED');

    expect(error.message).toBe(
      'The proposed refusal was not reviewed: a person reviews it before the application is decided.',
    );

    expect(error.facts).toEqual({});
  });
});
