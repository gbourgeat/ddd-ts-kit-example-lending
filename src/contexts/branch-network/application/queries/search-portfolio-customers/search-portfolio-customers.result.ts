import type { Page } from '@ddd-ts-kit/kernel';

/** A customer of a portfolio, as the branch network knows it: the identifier of the customer, nothing of its file. */
export interface SearchPortfolioCustomersItem {
  readonly id: string;
}

/** The customers of a portfolio are ordered by their identifier. */
export type SearchPortfolioCustomersSort = 'id';

export type SearchPortfolioCustomersResult = Page<SearchPortfolioCustomersItem>;
