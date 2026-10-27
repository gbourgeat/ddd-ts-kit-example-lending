import type { Page } from '@ddd-ts-kit/kernel';

export interface GetCustomerFileItem {
  readonly id: string;
  // TODO(domain): declare the rest of one line of the search exactly as the reader needs it, flat and serializable; this is a read model, not the aggregate.
}

// TODO(domain): name the fields a client may sort "get customer file" by; the read port orders by one of them and then by `id`.
export type GetCustomerFileSort = 'id';

export type GetCustomerFileResult = Page<GetCustomerFileItem>;
