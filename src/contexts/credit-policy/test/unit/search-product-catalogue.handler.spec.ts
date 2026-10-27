import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { SearchProductCatalogueHandler } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.handler';
import { SearchProductCatalogueQuery } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.query';
import type { SearchProductCatalogueResult } from '@/contexts/credit-policy/application/queries/search-product-catalogue/search-product-catalogue.result';
import { FakeSearchProductCatalogueReader } from '@/contexts/credit-policy/test/fakes/search-product-catalogue-reader.fake';

type CatalogueProduct = SearchProductCatalogueResult['products'][number];

const personalLoan: CatalogueProduct = {
  id: 'personal-loan',
  amountMinimumCents: 100000,
  amountMaximumCents: 2000000,
  durationMinimumMonths: 6,
  durationMaximumMonths: 84,
  arrangementFeeCents: 5000,
  insuranceMandatory: false,
};

const carLoan: CatalogueProduct = { ...personalLoan, id: 'car-loan', insuranceMandatory: true };
const termLoan: CatalogueProduct = { ...personalLoan, id: 'term-loan', arrangementFeeCents: 0 };
const catalogue = [personalLoan, carLoan, termLoan];

describe('Search product catalogue', () => {
  it('answers the first page of the catalogue to an applicant without a permission', async () => {
    const queryBus = arrange(catalogue);

    expect(await queryBus.execute(new SearchProductCatalogueQuery(1, 2))).toEqual({
      products: [personalLoan, carLoan],
    });
  });

  it('answers the products of the following page only', async () => {
    const queryBus = arrange(catalogue);

    expect(await queryBus.execute(new SearchProductCatalogueQuery(2, 2))).toEqual({ products: [termLoan] });
  });

  it('answers no product past the last page', async () => {
    const queryBus = arrange(catalogue);

    expect(await queryBus.execute(new SearchProductCatalogueQuery(3, 2))).toEqual({ products: [] });
  });

  it('answers an empty catalogue when no product is defined', async () => {
    const queryBus = arrange([]);

    expect(await queryBus.execute(new SearchProductCatalogueQuery(1, 2))).toEqual({ products: [] });
  });
});

function arrange(products: readonly CatalogueProduct[]) {
  const { queryBus } = createTestBuses();
  const handler = new SearchProductCatalogueHandler(new FakeSearchProductCatalogueReader(products));

  return queryBus.register(SearchProductCatalogueQuery, handler);
}
