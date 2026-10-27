import type { SearchProductCatalogueReader } from '@/contexts/credit-policy/application/ports/search-product-catalogue-reader.port';
import type { SearchProductCatalogueQuery } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.query';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';

type CatalogueProduct = SearchProductCatalogueResult['products'][number];

export class FakeSearchProductCatalogueReader implements SearchProductCatalogueReader {
  constructor(private readonly products: readonly CatalogueProduct[]) {}

  async read(query: SearchProductCatalogueQuery): Promise<SearchProductCatalogueResult> {
    const first = (query.page - 1) * query.pageSize;

    return { products: this.products.slice(first, first + query.pageSize) };
  }
}
