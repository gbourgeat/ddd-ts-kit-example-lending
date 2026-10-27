import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { SearchProductCatalogueReader } from '@/contexts/credit-policy/application/ports/search-product-catalogue-reader.port';
import type { SearchProductCatalogueQuery } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.query';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';

export class SearchProductCatalogueHandler implements QueryHandler<SearchProductCatalogueQuery> {
  constructor(private readonly reader: SearchProductCatalogueReader) {}

  async execute(query: SearchProductCatalogueQuery): Promise<SearchProductCatalogueResult> {
    return this.reader.read(query);
  }
}
