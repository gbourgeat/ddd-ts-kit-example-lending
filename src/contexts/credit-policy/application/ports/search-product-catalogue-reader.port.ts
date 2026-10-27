import type { SearchProductCatalogueQuery } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.query';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';

export abstract class SearchProductCatalogueReader {
  abstract read(query: SearchProductCatalogueQuery): Promise<SearchProductCatalogueResult>;
}
