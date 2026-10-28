import { describe, expect, it } from '@jest/globals';
import { productTermsCriteria } from '@/contexts/credit-application/file/application/projections/product-terms-criteria.projection';

describe('Product terms criteria', () => {
  it('orders the product terms by product identifier when two lines match alike', () => {
    expect(productTermsCriteria.tieBreaker).toBe('productId');
  });
});
