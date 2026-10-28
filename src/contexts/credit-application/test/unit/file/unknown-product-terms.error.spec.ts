import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownProductTerms } from '@/contexts/credit-application/file/domain/errors/unknown-product-terms.error';

describe('UnknownProductTerms', () => {
  it('refuses for unknown product terms with the code UNKNOWN_PRODUCT_TERMS', () => {
    const error = UnknownProductTerms.forUnknownProductTerms();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_PRODUCT_TERMS');
    expect(error.message).toBe('Unknown product terms.');
    expect(error.facts).toEqual({});
  });
});
