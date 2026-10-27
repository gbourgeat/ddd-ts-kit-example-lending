import { Query } from '@ddd-ts-kit/kernel';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';

export class SearchProductCatalogueQuery extends Query<SearchProductCatalogueResult> {
  constructor(
    readonly page: number,
    readonly pageSize: number,
  ) {
    super();
  }
}
