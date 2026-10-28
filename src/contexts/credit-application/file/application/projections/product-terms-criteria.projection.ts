import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { ProductTermsRow } from '@/contexts/credit-application/file/application/ports/product-terms.port';

/** What a read of the product terms read model may filter by. */
export const productTermsCriteria = defineCriteria<ProductTermsRow>({
  fields: {
    productId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'productId',
});
