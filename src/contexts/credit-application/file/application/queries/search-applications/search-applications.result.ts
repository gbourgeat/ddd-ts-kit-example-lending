import type { Page } from '@ddd-ts-kit/kernel';

/** One application of the list, as the read model keeps it: flat and serializable, never the aggregate. */
export interface SearchApplicationsItem {
  readonly id: string;
  readonly applicantId: string;
  readonly requestedAmountCents: number;
  readonly durationMonths: number;
}

/** The applications are listed by their identifier, in either direction. */
export type SearchApplicationsSort = 'id';

export type SearchApplicationsResult = Page<SearchApplicationsItem>;
