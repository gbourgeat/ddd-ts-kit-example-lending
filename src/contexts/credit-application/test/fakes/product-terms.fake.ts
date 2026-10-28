import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type {
  ProductTermsRow,
  ProductTerms,
} from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { productTermsCriteria } from '@/contexts/credit-application/file/application/projections/product-terms-criteria.projection';

/** The product terms read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeProductTerms extends InMemoryReadModelStore<ProductTermsRow> implements ProductTerms {
  constructor() {
    super(productTermsCriteria);
  }
}
