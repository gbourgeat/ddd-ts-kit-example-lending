import type { Page } from '@ddd-ts-kit/kernel';

/** One alert as the compliance list shows it: a read model, flat and serializable. */
export interface SearchAlertsItem {
  readonly id: string;
  readonly repaymentReference: string;
}

export type SearchAlertsSort = 'id';

export type SearchAlertsResult = Page<SearchAlertsItem>;
