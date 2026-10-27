import type { Page } from '@ddd-ts-kit/kernel';

export interface GetCustomerFileItem {
  readonly id: string;
  readonly identifiedAt: Date;
}

/** The fields a client may sort the search by: the identifier, the only order of the read model. */
export type GetCustomerFileSort = 'id';

export type GetCustomerFileResult = Page<GetCustomerFileItem>;
