import type { Page } from '@ddd-ts-kit/kernel';

/** A portfolio of the advisor, as the branch network knows it: the identifier of the portfolio, nothing of its file. */
export interface SearchAdvisorPortfoliosItem {
  readonly id: string;
}

/** The portfolios of an advisor are ordered by their identifier. */
export type SearchAdvisorPortfoliosSort = 'id';

export type SearchAdvisorPortfoliosResult = Page<SearchAdvisorPortfoliosItem>;
